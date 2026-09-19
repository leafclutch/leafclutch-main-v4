#!/usr/bin/env python3
"""
Move every base64 image out of the database and into the media bucket.

Anything uploaded before the switch to Supabase Storage was base64-encoded into
the row that referenced it, so the bytes travel with every read of that table
and end up in each visitor's cached copy of the site. This re-encodes each one
to WebP, uploads it to the bucket and replaces the column with the public URL.

Reads credentials from .env.local. Nothing is written without --apply, and the
original values are saved to a local backup file first so the change can be
undone.

    python3 scripts/migrate-images-to-bucket.py            # show what would happen
    python3 scripts/migrate-images-to-bucket.py --apply    # do it
    python3 scripts/migrate-images-to-bucket.py --restore backups/<file>.json
    python3 scripts/migrate-images-to-bucket.py --prune-orphans [--apply]

Close any open admin panel first. It mirrors its whole in-memory copy back to
the database when anything changes, which will undo this from a stale tab.
"""

import base64
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BACKUP_DIR = ROOT / "backups"
BUCKET = "media"
QUALITY = 82

# (table, image column, bucket folder, longest edge kept)
# Folders match the layout documented in supabase/2storage.sql.
TARGETS = [
    ("members", "photo", "team", 1000),
    ("services", "hero_image", "products", 1600),
    ("services", "icon_image", "products", 512),
    ("service_images", "url", "products", 1600),
    ("service_features", "image", "products", 1200),
    ("testimonials", "photo", "testimonials", 800),
    ("testimonials", "certificate_image", "certificates", 1600),
    ("company_services", "cover_image", "services", 1600),
    ("company_services", "icon_image", "services", 512),
    ("blogs", "featured_image", "blogs", 1600),
    ("portfolio_projects", "cover_image", "portfolio", 1600),
    ("portfolio_images", "url", "portfolio", 1600),
    ("clients", "logo", "clients", 512),
    ("website_images", "url", "general", 1600),
    ("home_sections", "image", "general", 1600),
]

# Used to name the file readably; the first one a row actually has wins.
LABEL_COLUMNS = ("name", "title", "label", "slug")


def load_env() -> tuple[str, str]:
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        sys.exit(".env.local not found — run this from the project root.")

    values: dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip().strip("'\"")

    url = values.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    # The service-role key bypasses row-level security, which is what lets this
    # update rows and upload without signing in as a person.
    key = values.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        sys.exit("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
    return url, key


def request(method: str, url: str, key: str, *, body=None, headers=None):
    hdrs = {"apikey": key, "Authorization": f"Bearer {key}"}
    hdrs.update(headers or {})
    req = urllib.request.Request(url, data=body, method=method, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")


def encode(data_url: str, max_edge: int) -> tuple[bytes, str, str]:
    """
    Decode a data: URL and return (body, content type, extension).

    SVG has no pixels to resample and GIF would lose its animation, so both are
    passed through untouched; everything else becomes WebP.
    """
    header, _, encoded = data_url.partition(",")
    raw = base64.b64decode(encoded)
    mime = header.split(";")[0].removeprefix("data:") or "image/png"

    if mime in ("image/svg+xml", "image/gif"):
        return raw, mime, "svg" if mime == "image/svg+xml" else "gif"

    image = Image.open(io.BytesIO(raw))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.mode else "RGB")
    if max(image.size) > max_edge:
        scale = max_edge / max(image.size)
        image = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.LANCZOS,
        )
    buffer = io.BytesIO()
    image.save(buffer, "WEBP", quality=QUALITY, method=6)
    return buffer.getvalue(), "image/webp", "webp"


def url_is_live(link: str) -> bool:
    """A stored URL is only useful if the object behind it still exists."""
    try:
        with urllib.request.urlopen(urllib.request.Request(link, method="GET"), timeout=20) as r:
            return r.status == 200 and r.headers.get("content-type", "").startswith("image/")
    except Exception:
        return False


def label_for(row: dict, table: str) -> str:
    for column in LABEL_COLUMNS:
        value = row.get(column)
        if isinstance(value, str) and value.strip():
            return slugify(value)[:40] or table
    return table


def fetch(url: str, key: str, table: str) -> list[dict] | None:
    status, body = request("GET", f"{url}/rest/v1/{table}?select=*", key)
    if status != 200:
        return None
    try:
        rows = json.loads(body)
    except Exception:
        return None
    return rows if isinstance(rows, list) else None


def list_bucket(url: str, key: str) -> list[str]:
    """Every file in the bucket, walking the folders the uploader writes to."""
    folders = sorted({folder for _, _, folder, _ in TARGETS} | {""})
    names: set[str] = set()
    for folder in folders:
        status, body = request(
            "POST",
            f"{url}/storage/v1/object/list/{BUCKET}",
            key,
            body=json.dumps({"prefix": f"{folder}/" if folder else "", "limit": 1000}).encode(),
            headers={"Content-Type": "application/json"},
        )
        if status != 200:
            continue
        for entry in json.loads(body):
            # Folders come back without an id; only real files have one.
            if entry.get("id"):
                names.add(f"{folder}/{entry['name']}" if folder else entry["name"])
    return sorted(names)


def referenced_paths(url: str, key: str) -> set[str]:
    """Bucket paths that some row still points at."""
    marker = f"/object/public/{BUCKET}/"
    paths: set[str] = set()
    for table, column, _, _ in TARGETS:
        rows = fetch(url, key, table)
        for row in rows or []:
            value = row.get(column)
            if isinstance(value, str) and marker in value:
                paths.add(urllib.parse.unquote(value.split(marker, 1)[1].split("?")[0]))
    return paths


def prune_orphans(url: str, key: str, apply_changes: bool) -> None:
    """Delete bucket files no row references — replaced or abandoned uploads."""
    objects = list_bucket(url, key)
    keep = referenced_paths(url, key)
    orphans = [name for name in objects if name not in keep]

    print(f"{len(objects)} files in the bucket, {len(keep)} still referenced")
    if not orphans:
        print("No orphans.")
        return
    print(f"{len(orphans)} orphaned:")
    for name in orphans:
        print(f"   {name}")

    if not apply_changes:
        print("\nDry run. Re-run with --apply to delete them.")
        return

    status, body = request(
        "DELETE",
        f"{url}/storage/v1/object/{BUCKET}",
        key,
        body=json.dumps({"prefixes": orphans}).encode(),
        headers={"Content-Type": "application/json"},
    )
    print(
        f"\nDeleted {len(orphans)} files."
        if status == 200
        else f"\nDelete failed ({status}): {body[:200]!r}"
    )


def main() -> None:
    apply_changes = "--apply" in sys.argv
    url, key = load_env()

    if "--prune-orphans" in sys.argv:
        prune_orphans(url, key, apply_changes)
        return

    if "--restore" in sys.argv:
        entries = json.loads(Path(sys.argv[sys.argv.index("--restore") + 1]).read_text())
        print(f"Restoring {len(entries)} values")
        for entry in entries:
            status, body = request(
                "PATCH",
                f"{url}/rest/v1/{entry['table']}?id=eq.{urllib.parse.quote(str(entry['id']))}",
                key,
                body=json.dumps({entry["column"]: entry["value"]}).encode(),
                headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
            )
            ok = "ok" if status in (200, 204) else f"FAILED {status} {body[:100]!r}"
            print(f"  {entry['table']}.{entry['column']} {str(entry['id'])[:24]:26} {ok}")
        return

    jobs, backup, broken = [], [], []
    for table, column, folder, max_edge in TARGETS:
        rows = fetch(url, key, table)
        if rows is None:
            print(f"  {table + '.' + column:36} (table not readable — skipped)")
            continue
        for row in rows:
            value = row.get(column)
            if not isinstance(value, str) or not value:
                continue
            if value.startswith("data:"):
                jobs.append((table, column, folder, max_edge, row, value))
                backup.append(
                    {"table": table, "column": column, "id": row.get("id"), "value": value}
                )
            elif value.startswith("http") and not url_is_live(value):
                # A row can point at an object that is gone — an upload that
                # stored a path it never wrote, or a stale tab restoring an old
                # value. Filenames are derived from the row, so the migrated
                # copy can usually be found and the row pointed back at it.
                stem = f"{folder}/{label_for(row, table)}-{slugify(str(row.get('id')))[-6:]}"
                for candidate in (
                    f"{url}/storage/v1/object/public/{BUCKET}/{stem}-{slugify(column)}.webp",
                    f"{url}/storage/v1/object/public/{BUCKET}/{stem}.webp",
                ):
                    if url_is_live(candidate):
                        broken.append((table, column, row, candidate))
                        break
                else:
                    print(
                        f"  {table + '.' + column:32} {str(row.get('id'))[:18]:20} "
                        "URL is dead and no migrated copy exists"
                    )

    for table, column, row, candidate in broken:
        if not apply_changes:
            print(f"  {table + '.' + column:32} repair -> {candidate.rsplit('/', 1)[-1]}")
            continue
        status, response = request(
            "PATCH",
            f"{url}/rest/v1/{table}?id=eq.{urllib.parse.quote(str(row.get('id')))}",
            key,
            body=json.dumps({column: candidate}).encode(),
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
        state = "repaired" if status in (200, 204) else f"REPAIR FAILED {status} {response[:100]!r}"
        print(f"  {table + '.' + column:32} {state}")

    if not jobs:
        if not broken:
            print("No base64 images left in the database, and every stored URL resolves.")
        elif not apply_changes:
            print("\nDry run. Re-run with --apply to make these changes.")
        return

    total_before = sum(len(v) for *_, v in jobs)
    print(f"{len(jobs)} images to migrate, {total_before/1024/1024:.2f} MB in the database\n")

    if apply_changes:
        BACKUP_DIR.mkdir(exist_ok=True)
        backup_path = BACKUP_DIR / f"images-{time.strftime('%Y%m%d-%H%M%S')}.json"
        backup_path.write_text(json.dumps(backup))
        print(f"Backup written to {backup_path.relative_to(ROOT)}\n")

    total_after = failures = 0
    for table, column, folder, max_edge, row, value in jobs:
        name = f"{table}.{column}"
        try:
            body, content_type, extension = encode(value, max_edge)
        except Exception as error:
            print(f"  {name:32} {str(row.get('id'))[:18]:20} SKIPPED — {error}")
            failures += 1
            continue
        total_after += len(body)

        path = (
            f"{folder}/{label_for(row, table)}-"
            f"{slugify(str(row.get('id')))[-6:]}-{slugify(column)}.{extension}"
        )
        public_url = f"{url}/storage/v1/object/public/{BUCKET}/{path}"
        sizes = f"{len(value)/1024:7.1f} KB -> {len(body)/1024:6.1f} KB"

        if not apply_changes:
            print(f"  {name:32} {sizes}  {path}")
            continue

        status, response = request(
            "POST",
            f"{url}/storage/v1/object/{BUCKET}/{path}",
            key,
            body=body,
            headers={
                "Content-Type": content_type,
                "Cache-Control": "31536000",
                "x-upsert": "true",
            },
        )
        if status not in (200, 201):
            print(f"  {name:32} UPLOAD FAILED {status} {response[:120]!r}")
            failures += 1
            continue

        status, response = request(
            "PATCH",
            f"{url}/rest/v1/{table}?id=eq.{urllib.parse.quote(str(row.get('id')))}",
            key,
            body=json.dumps({column: public_url}).encode(),
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
        if status not in (200, 204):
            print(f"  {name:32} ROW UPDATE FAILED {status} {response[:120]!r}")
            failures += 1
            continue

        print(f"  {name:32} {sizes}  uploaded")

    print(
        f"\n{total_before/1024/1024:.2f} MB in the database -> "
        f"{total_after/1024/1024:.2f} MB in the bucket"
    )
    if failures:
        print(f"{failures} failed — rerun to retry just those.")
    if not apply_changes:
        print("\nDry run. Re-run with --apply to make these changes.")


if __name__ == "__main__":
    main()
