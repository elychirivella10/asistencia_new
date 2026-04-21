import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import unicodedata
import re
import bcrypt
from difflib import get_close_matches, SequenceMatcher

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
AREA_MATCH_THRESHOLD = float(os.getenv("AREA_MATCH_THRESHOLD", 0.72))
ODS_FILE = "PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods"
OUTPUT_DIR = "outputs"

# Ensure output directory exists
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Common connectors in Spanish surnames
CONNECTORS = {"DE", "DEL", "LA", "LAS", "LOS", "Y"}

def normalize_simple(text):
    """Basic text normalization: uppercase, remove accents, and trim."""
    if pd.isna(text) or text is None:
        return ""
    text = str(text).strip().upper()
    # Remove accents
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    return text

def parse_name_smart(full_name):
    """
    Intelligently extracts the first name and first last name.
    Follows Names + Surnames pattern.
    """
    text = normalize_simple(full_name)
    # Filter out initials (length <= 1)
    parts = [p for p in text.split() if len(p) > 1]
    
    if not parts:
        return "NEW", "USER"
    
    first_name = parts[0]
    last_name = ""
    
    if len(parts) == 2:
        last_name = parts[1]
    elif len(parts) >= 3:
        # Heuristic: 3rd word is usually the first surname (N1 N2 A1 A2)
        # Skip common connectors
        idx = 2
        while idx < len(parts) and parts[idx] in CONNECTORS:
            idx += 1
        
        if idx < len(parts):
            last_name = parts[idx]
        else:
            last_name = parts[1]
    else:
        last_name = parts[0]
        
    return first_name, last_name

def generate_unique_email(fname, lname, used_emails, collisions_list, full_name_raw):
    """Generates a unique email and tracks collisions for reporting."""
    base = f"{fname.lower()}.{lname.lower()}"
    email = f"{base}@sapi.gob.ve"
    
    was_collision = False
    if email in used_emails:
        was_collision = True
        
    counter = 2
    while email in used_emails:
        email = f"{base}{counter}@sapi.gob.ve"
        counter += 1
        
    if was_collision:
        collisions_list.append({
            'Full Name': full_name_raw,
            'Original Email': f"{base}@sapi.gob.ve",
            'Assigned Email': email
        })
        
    used_emails.add(email)
    return email

def normalize_cedula(cedula):
    """Cleans IDs/ID cards to standard numeric strings."""
    if pd.isna(cedula) or cedula is None: return ""
    cedula = str(cedula).strip()
    if isinstance(cedula, (int, float)):
        return str(int(cedula))
    if '.' in cedula: cedula = cedula.split('.')[0]
    cedula = re.sub(r'\D', '', cedula)
    return cedula

def get_db_users(cur):
    """Fetches current users from the database."""
    cur.execute("SELECT id, nombre, apellido, email, cedula, es_activo, area_id FROM usuarios")
    rows = cur.fetchall()
    return {row[4]: {
        'id': row[0], 'name': row[1], 'last_name': row[2], 
        'email': row[3], 'is_active': row[5], 'area_id': row[6]
    } for row in rows}

def get_areas_map(cur):
    """Fetches existing areas for mapping."""
    cur.execute("SELECT id, nombre FROM areas")
    rows = cur.fetchall()
    return {normalize_simple(row[1]): row[0] for row in rows}

def find_best_area_id(location_text, areas_map_norm):
    """Maps Excel location text to a DB area ID using exact or fuzzy match."""
    norm_loc = normalize_simple(location_text)
    if not norm_loc: return None
    
    # Exact match first
    if norm_loc in areas_map_norm:
        return areas_map_norm[norm_loc]
    
    # Fuzzy match with threshold
    matches = get_close_matches(norm_loc, list(areas_map_norm.keys()), n=1, cutoff=AREA_MATCH_THRESHOLD)
    if matches:
        return areas_map_norm[matches[0]]
    
    return None

def main(dry_run=True):
    print(f"\n--- 🔄 SMART SYNC (MODE: {'DRY-RUN' if dry_run else 'APPLY'}) ---")
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    db_users = get_db_users(cur)
    areas_map = get_areas_map(cur)
    
    cur.execute("SELECT id FROM roles WHERE nombre = 'EMPLEADO' LIMIT 1")
    default_role_id = cur.fetchone()[0]
    cur.execute("SELECT id FROM turnos LIMIT 1")
    default_shift_id = cur.fetchone()[0]

    print(f"Reading official Excel data...")
    df_excel = pd.read_excel(ODS_FILE, engine="odf", sheet_name="Hoja1", header=6)
    
    to_insert, to_update, to_deactivate = [], [], []
    processed_ids = set()
    used_emails = set()
    collisions = []
    missing_area_report = []

    for _, row in df_excel.iterrows():
        id_num = normalize_cedula(row['  CÉDULA'])
        raw_name = row['   NOMBRES Y APELLIDOS']
        raw_location = row['UBICACIÓN FÍSICA']
        
        if not id_num or pd.isna(raw_name): continue
        processed_ids.add(id_num)
        
        fname, lname = parse_name_smart(raw_name)
        email = generate_unique_email(fname, lname, used_emails, collisions, raw_name)
        area_id = find_best_area_id(raw_location, areas_map)
        
        if area_id is None:
            missing_area_report.append({'ID': id_num, 'Raw Name': raw_name, 'Excel Location': raw_location})
        
        if id_num in db_users:
            user = db_users[id_num]
            needs_update = (user['name'] != fname or user['last_name'] != lname or 
                          user['email'] != email or user['area_id'] != area_id or not user['is_active'])
            
            if needs_update:
                to_update.append({
                    'id': user['id'], 'id_num': id_num, 'fname': fname, 'lname': lname,
                    'email': email, 'area_id': area_id
                })
        else:
            to_insert.append({'id_num': id_num, 'fname': fname, 'lname': lname, 'email': email, 'area_id': area_id})

    # Identify deactivations
    for id_db, user in db_users.items():
        if id_db not in processed_ids and user['is_active']:
            to_deactivate.append({'id': user['id'], 'id_num': id_db, 'name': f"{user['name']} {user['last_name']}"})

    if dry_run:
        print(f"\n[!] SIMULATION: {len(to_insert)} Inserts, {len(to_update)} Updates, {len(to_deactivate)} Deactivations")
        pd.DataFrame(to_insert).to_csv(os.path.join(OUTPUT_DIR, "dry_run_inserts.csv"), index=False)
        pd.DataFrame(to_update).to_csv(os.path.join(OUTPUT_DIR, "dry_run_updates.csv"), index=False)
        pd.DataFrame(to_deactivate).to_csv(os.path.join(OUTPUT_DIR, "dry_run_deactivations.csv"), index=False)
        if collisions: pd.DataFrame(collisions).to_csv(os.path.join(OUTPUT_DIR, "email_collisions.csv"), index=False)
        if missing_area_report: pd.DataFrame(missing_area_report).to_csv(os.path.join(OUTPUT_DIR, "missing_areas.csv"), index=False)
        conn.close()
        return

    # APPLY CHANGES
    print("\n🚀 Committing changes to the database...")
    for u in to_insert:
        hashed_pw = bcrypt.hashpw(u['id_num'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute("""
            INSERT INTO usuarios (id, nombre, apellido, email, biometric_id, cedula, es_activo, rol_id, turno_id, password, area_id)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, True, %s, %s, %s, %s)
        """, (u['fname'], u['lname'], u['email'], u['id_num'], u['id_num'], default_role_id, default_shift_id, hashed_pw, u['area_id']))

    for u in to_update:
        cur.execute("UPDATE usuarios SET nombre = %s, apellido = %s, email = %s, area_id = %s, es_activo = True WHERE id = %s",
                    (u['fname'], u['lname'], u['email'], u['area_id'], u['id']))

    for u in to_deactivate:
        cur.execute("UPDATE usuarios SET es_activo = False WHERE id = %s", (u['id'],))

    # Save final reports
    pd.DataFrame(to_insert).to_csv(os.path.join(OUTPUT_DIR, "final_inserts.csv"), index=False)
    pd.DataFrame(to_update).to_csv(os.path.join(OUTPUT_DIR, "final_updates.csv"), index=False)
    pd.DataFrame(to_deactivate).to_csv(os.path.join(OUTPUT_DIR, "final_deactivations.csv"), index=False)
    if collisions: pd.DataFrame(collisions).to_csv(os.path.join(OUTPUT_DIR, "email_collisions.csv"), index=False)
    if missing_area_report: pd.DataFrame(missing_area_report).to_csv(os.path.join(OUTPUT_DIR, "missing_areas.csv"), index=False)

    conn.commit()
    conn.close()
    print(f"✨ Sync completed. Reports saved in /'{OUTPUT_DIR}'")

if __name__ == "__main__":
    import sys
    apply = "--apply" in sys.argv
    main(dry_run=not apply)
