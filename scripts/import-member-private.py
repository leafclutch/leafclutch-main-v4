#!/usr/bin/env python3
"""
Load the private columns of members_rows.csv into member_private.

The public seed (17seed-historical-members.sql) deliberately left out date of
birth, phone number and email addresses, because every column of `members` is
readable by the public for anyone who is visible. This puts them in
member_private instead, which only an active admin can read.

Rows are matched to members by the id they had in the old system, falling back
to the name for the seven people who already existed here under a different id.

    python3 scripts/import-member-private.py           # show what would happen
    python3 scripts/import-member-private.py --apply   # do it

Requires supabase/18member-private.sql to have been run.
"""

import csv
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "members_rows.csv"


def load_env() -> tuple[str, str]:
    values: dict[str, str] = {}
    for line in (ROOT / ".env.local").read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip("'\"")
    url = values.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    key = values.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        sys.exit("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
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


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def main() -> None:
    apply_changes = "--apply" in sys.argv
    url, key = load_env()

    if not CSV_PATH.exists():
        sys.exit(f"{CSV_PATH.name} not found — it is gitignored, so keep a local copy to re-run this.")

    status, body = request("GET", f"{url}/rest/v1/members?select=id,name", key)
    if status != 200:
        sys.exit(f"Could not read members ({status})")
    members = json.loads(body)
    by_id = {m["id"] for m in members}
    norm = lambda s: re.sub(r"[^a-z]", "", (s or "").lower())
    by_name = {norm(m["name"]): m["id"] for m in members}

    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8-sig")))
    payload, unmatched = [], []
    for row in rows:
        member_id = row["id"] if row["id"] in by_id else by_name.get(norm(row["name"]))
        if not member_id:
            unmatched.append(row["name"])
            continue
        entry = {
            "member_id": member_id,
            "date_of_birth": clean(row["dob"])[:10] or None,
            "phone": clean(row["phone_number"]) or None,
            "personal_email": clean(row["personal_email"]) or None,
            "company_email": clean(row["company_email"]) or None,
        }
        # Nothing worth storing for this person.
        if any(entry[k] for k in ("date_of_birth", "phone", "personal_email", "company_email")):
            payload.append(entry)

    print(f"{len(rows)} rows in the export")
    print(f"  {len(payload)} have private details to store")
    print(f"  {len(unmatched)} could not be matched to a member{': ' + ', '.join(unmatched) if unmatched else ''}")
    filled = lambda k: sum(1 for e in payload if e[k])
    for column in ("date_of_birth", "phone", "personal_email", "company_email"):
        print(f"    {column:15} {filled(column)}")

    if not apply_changes:
        print("\nDry run. Re-run with --apply to store them.")
        return

    status, body = request(
        "POST",
        f"{url}/rest/v1/member_private",
        key,
        body=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    if status in (200, 201, 204):
        print(f"\nStored {len(payload)} rows.")
    elif b"member_private" in body and b"does not exist" in body:
        print("\nmember_private does not exist yet — run supabase/18member-private.sql first.")
    else:
        print(f"\nFailed ({status}): {body[:300]!r}")


if __name__ == "__main__":
    main()
