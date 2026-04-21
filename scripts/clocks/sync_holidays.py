"""
sync_holidays.py
Syncs Venezuelan public holidays into the `feriados` database table
using the `date-holidays` npm package via a Node.js subprocess.

Note: Forces UTF-8 output on Windows to correctly display accented characters.

Usage:
    python scripts/holidays/sync_holidays.py              # current year
    python scripts/holidays/sync_holidays.py --year 2026  # specific year
    python scripts/holidays/sync_holidays.py --year 2025 --year 2026  # multiple years
"""

import argparse
import json
import sys

# Force UTF-8 output so accented names display correctly on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import os
import subprocess

from datetime import datetime, UTC

import psycopg2
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────
_this_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(os.path.dirname(_this_dir))
load_dotenv(os.path.join(_project_root, ".env"))

DB_URL = os.getenv("DATABASE_URL", "").split("?")[0]
JS_HELPER = os.path.join(_this_dir, "get_holidays.js")
CURRENT_YEAR = datetime.now(UTC).year


# ── Node.js helper ────────────────────────────────────────────────────────────
def fetch_holidays_from_node(year: int) -> list[dict]:
    """Calls get_holidays.js and returns parsed JSON list."""
    try:
        result = subprocess.run(
            ["node", JS_HELPER, str(year)],
            capture_output=True,
            encoding="utf-8",   # Node.js writes UTF-8; must decode with utf-8 on Windows
            timeout=30,
        )
        if result.returncode != 0:
            print(f"  ❌ Node error (year {year}): {result.stderr.strip()}")
            return []
        return json.loads(result.stdout)
    except FileNotFoundError:
        print("  ❌ 'node' not found. Make sure Node.js is installed.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"  ❌ Invalid JSON from Node.js: {e}")
        return []


# ── Database upsert ───────────────────────────────────────────────────────────
def upsert_holidays(db_url: str, holidays: list[dict], year: int) -> tuple[int, int]:
    """
    Upserts holidays into the `feriados` table.
    Returns (inserted_count, updated_count).
    """
    if not holidays:
        return 0, 0

    inserted = 0
    updated = 0

    sql = """
        INSERT INTO feriados (fecha, descripcion, es_recurrente)
        VALUES (%(fecha)s, %(descripcion)s, true)
        ON CONFLICT (fecha)
        DO UPDATE SET
            descripcion   = EXCLUDED.descripcion,
            es_recurrente = true
        RETURNING (xmax = 0) AS was_inserted;
    """

    with psycopg2.connect(db_url) as conn:
        with conn.cursor() as cur:
            for h in holidays:
                cur.execute(sql, {"fecha": h["date"], "descripcion": h["name"]})
                row = cur.fetchone()
                if row and row[0]:
                    inserted += 1
                else:
                    updated += 1
        conn.commit()

    return inserted, updated


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Sync Venezuelan public holidays into the feriados table."
    )
    parser.add_argument(
        "--year",
        type=int,
        action="append",
        dest="years",
        metavar="YEAR",
        help="Year(s) to sync (default: current year). Can be repeated.",
    )
    args = parser.parse_args()
    years = args.years or [CURRENT_YEAR]

    if not DB_URL:
        print("❌ DATABASE_URL is not set in the environment.")
        sys.exit(1)

    print(f"🗓️  Syncing holidays for: {years}")
    print(f"📡 DB: {DB_URL[:40]}...")

    total_inserted = 0
    total_updated = 0

    for year in years:
        print(f"\n── Year {year} ──────────────────────────")
        holidays = fetch_holidays_from_node(year)
        if not holidays:
            print(f"  ⚠️  No holidays returned for {year}.")
            continue

        print(f"  📋 Found {len(holidays)} public holidays:")
        for h in holidays:
            print(f"     {h['date']}  {h['name']}")

        ins, upd = upsert_holidays(DB_URL, holidays, year)
        total_inserted += ins
        total_updated += upd
        print(f"  ✅ Inserted: {ins}  |  Updated: {upd}")

    print(f"\n🎉 Done! Total → Inserted: {total_inserted} | Updated: {total_updated}")


if __name__ == "__main__":
    main()
