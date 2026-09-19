#!/usr/bin/env python3
"""
Move member photos out of the `members` table and into the media bucket.

Photos uploaded before the switch to Supabase Storage were base64-encoded into
the row itself, so every read of the table carries them — for the About page
that is roughly a megabyte before anything is rendered. This re-encodes each
one to WebP, uploads it to media/team/ and replaces the column with the URL.

Reads credentials from .env.local. Nothing is written without --apply, and the
original values are saved to a local backup file first so the change can be
undone.

    python3 scripts/migrate-member-photos.py           # show what would happen
    python3 scripts/migrate-member-photos.py --apply   # do it
    python3 scripts/migrate-member-photos.py --restore backups/<file>.json
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
FOLDER = "team"
# Founder portraits render at 500x500, so this stays sharp on a 2x display.
MAX_EDGE = 1000
QUALITY = 82


def load_env() -> tuple[str, str]:
    """Pull the project URL and service-role key out of .env.local."""
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
    # script update rows and upload without signing in as a person.
    key = values.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        sys.exit("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
    return url, key


def request(method: str, url: str, key: str, *, body=None, headers=None):
    hdrs = {"apikey": key, "Authorization": f"Bearer {key}"}
    hdrs.update(headers or {})
    req = urllib.request.Request(url, data=body, method=method, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "member"


def to_webp(data_url: str) -> bytes:
    """Decode a data: URL and re-encode it as a right-sized WebP."""
    _, _, encoded = data_url.partition(",")
    raw = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(raw))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.mode else "RGB")
    if max(image.size) > MAX_EDGE:
        scale = MAX_EDGE / max(image.size)
        image = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.LANCZOS,
        )
    buffer = io.BytesIO()
    image.save(buffer, "WEBP", quality=QUALITY, method=6)
    return buffer.getvalue()


def url_is_live(link: str) -> bool:
    """A stored URL is only useful if the object behind it still exists."""
    try:
        request_obj = urllib.request.Request(link, method="GET")
        with urllib.request.urlopen(request_obj, timeout=20) as response:
            return response.status == 200 and response.headers.get(
                "content-type", ""
            ).startswith("image/")
    except Exception:
        return False


def fetch_members(url: str, key: str) -> list[dict]:
    status, body = request(
        "GET", f"{url}/rest/v1/members?select=id,name,type,photo&order=sort_order.asc", key
    )
    if status != 200:
        sys.exit(f"Could not read members ({status}): {body[:200]!r}")
    return json.loads(body)


def restore(path: Path, url: str, key: str) -> None:
    entries = json.loads(Path(path).read_text())
    print(f"Restoring {len(entries)} member photos from {path.name}")
    for entry in entries:
        status, body = request(
            "PATCH",
            f"{url}/rest/v1/members?id=eq.{urllib.parse.quote(str(entry['id']))}",
            key,
            body=json.dumps({"photo": entry["photo"]}).encode(),
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
        state = "ok" if status in (200, 204) else f"FAILED {status} {body[:120]!r}"
        print(f"  {entry['name'][:30]:32} {state}")
    print("Done.")


def main() -> None:
    apply_changes = "--apply" in sys.argv
    url, key = load_env()

    if "--restore" in sys.argv:
        restore(Path(sys.argv[sys.argv.index("--restore") + 1]), url, key)
        return

    members = fetch_members(url, key)
    pending = [m for m in members if (m.get("photo") or "").startswith("data:")]

    # A row can hold a URL whose object is gone — an upload that reported a
    # path it never wrote, or a stale browser tab restoring an old value. The
    # migrated filename is derived from the name and id, so if that object is
    # in the bucket the row can simply be pointed back at it.
    broken = []
    for member in members:
        photo = member.get("photo") or ""
        if not photo.startswith("http") or url_is_live(photo):
            continue
        candidate = (
            f"{url}/storage/v1/object/public/{BUCKET}/{FOLDER}/"
            f"{slugify(member.get('name') or 'member')}-{slugify(str(member['id']))[-6:]}.webp"
        )
        if url_is_live(candidate):
            broken.append((member, candidate))
        else:
            print(f"  {(member.get('name') or '?')[:30]:32} URL is dead and no migrated copy exists")

    already = len(members) - len(pending) - len(broken)
    print(
        f"{len(members)} members: {len(pending)} to migrate, "
        f"{len(broken)} to repair, {already} already fine\n"
    )

    for member, candidate in broken:
        if not apply_changes:
            print(f"  {(member.get('name') or '?')[:30]:32} repair -> {candidate.rsplit('/', 1)[-1]}")
            continue
        status, body = request(
            "PATCH",
            f"{url}/rest/v1/members?id=eq.{urllib.parse.quote(str(member['id']))}",
            key,
            body=json.dumps({"photo": candidate}).encode(),
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
        state = "repaired" if status in (200, 204) else f"REPAIR FAILED {status} {body[:120]!r}"
        print(f"  {(member.get('name') or '?')[:30]:32} {state}")

    if not pending:
        if not apply_changes and broken:
            print("\nDry run. Re-run with --apply to make these changes.")
        elif not broken:
            print("Nothing to do.")
        return

    if apply_changes:
        BACKUP_DIR.mkdir(exist_ok=True)
        backup_path = BACKUP_DIR / f"member-photos-{time.strftime('%Y%m%d-%H%M%S')}.json"
        backup_path.write_text(
            json.dumps([{"id": m["id"], "name": m["name"], "photo": m["photo"]} for m in pending])
        )
        print(f"Backup written to {backup_path.relative_to(ROOT)}\n")

    before_total = after_total = 0
    failures = 0

    for member in pending:
        name = member.get("name") or "member"
        before = len(member["photo"])
        before_total += before
        try:
            webp = to_webp(member["photo"])
        except Exception as error:  # a corrupt or unreadable image
            print(f"  {name[:30]:32} SKIPPED — {error}")
            failures += 1
            continue
        after_total += len(webp)

        # Member ids all begin "member-", so the tail is what distinguishes
        # them. Keeps two people of the same name in separate files.
        path = f"{FOLDER}/{slugify(name)}-{slugify(str(member['id']))[-6:]}.webp"
        public_url = f"{url}/storage/v1/object/public/{BUCKET}/{path}"

        if not apply_changes:
            print(f"  {name[:30]:32} {before/1024:7.1f} KB -> {len(webp)/1024:6.1f} KB  {path}")
            continue

        status, body = request(
            "POST",
            f"{url}/storage/v1/object/{BUCKET}/{path}",
            key,
            body=webp,
            headers={"Content-Type": "image/webp", "Cache-Control": "31536000", "x-upsert": "true"},
        )
        if status not in (200, 201):
            print(f"  {name[:30]:32} UPLOAD FAILED {status} {body[:140]!r}")
            failures += 1
            continue

        status, body = request(
            "PATCH",
            f"{url}/rest/v1/members?id=eq.{urllib.parse.quote(str(member['id']))}",
            key,
            body=json.dumps({"photo": public_url}).encode(),
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
        if status not in (200, 204):
            print(f"  {name[:30]:32} ROW UPDATE FAILED {status} {body[:140]!r}")
            failures += 1
            continue

        print(f"  {name[:30]:32} {before/1024:7.1f} KB -> {len(webp)/1024:6.1f} KB  uploaded")

    print(
        f"\n{before_total/1024/1024:.2f} MB in the table -> "
        f"{after_total/1024/1024:.2f} MB in the bucket"
    )
    if failures:
        print(f"{failures} failed — rerun to retry just those.")
    if not apply_changes:
        print("\nDry run. Re-run with --apply to make these changes.")


if __name__ == "__main__":
    main()
