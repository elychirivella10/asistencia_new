import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import unicodedata
import re

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ODS_FILE = "PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods"
OUTPUT_DIR = "outputs"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def normalize_text(text):
    """Normalize text: uppercase, remove accents, and trim."""
    if pd.isna(text) or text is None:
        return ""
    text = str(text).strip().upper()
    # Normalize to remove accents
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    # Cleanup whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def normalize_cedula(cedula):
    """Clean ID numbers to standard numeric strings."""
    if pd.isna(cedula) or cedula is None:
        return ""
    if isinstance(cedula, (int, float)):
        try:
            return str(int(cedula))
        except:
            pass
    cedula = str(cedula).strip()
    if '.' in cedula:
        cedula = cedula.split('.')[0]
    cedula = re.sub(r'\D', '', cedula)
    return cedula

def main():
    print(f"--- Starting Personnel Comparison ---")
    
    # 1. Load data from Excel (ODS)
    print(f"Reading Excel file: {ODS_FILE}...")
    try:
        # Header is at row 7 (index 6)
        df_excel = pd.read_excel(ODS_FILE, engine="odf", sheet_name="Hoja1", header=6)
        
        id_col = "  CÉDULA"
        name_col = "   NOMBRES Y APELLIDOS"
        
        if id_col not in df_excel.columns or name_col not in df_excel.columns:
            print("Error: Expected columns not found.")
            return

        excel_records = []
        for _, row in df_excel.iterrows():
            ced = normalize_cedula(row[id_col])
            nom = normalize_text(row[name_col])
            if ced or nom:
                excel_records.append({'id_num': ced, 'full_name': nom})
        
        df_excel_clean = pd.DataFrame(excel_records)
        print(f"Total Excel records: {len(df_excel_clean)}")
        
    except Exception as e:
        print(f"Error processing Excel: {e}")
        return

    # 2. Load data from Biometric Database
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        df_db = pd.read_sql("SELECT cedula, nombre, apellido FROM usuarios WHERE es_activo = true", conn)
        conn.close()
        
        db_records = []
        for _, row in df_db.iterrows():
            ced = normalize_cedula(row['cedula'])
            full_name = normalize_text(f"{row['nombre']} {row['apellido']}")
            db_records.append({'id_num': ced, 'full_name': full_name})
            
        df_db_clean = pd.DataFrame(db_records)
        print(f"Total Active DB records: {len(df_db_clean)}")
        
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return

    # 3. Comparison Logic
    excel_ids = set(df_excel_clean['id_num']) - {""}
    db_ids = set(df_db_clean['id_num']) - {""}
    
    # A. Only in Excel
    only_excel_ids = excel_ids - db_ids
    only_excel = df_excel_clean[df_excel_clean['id_num'].isin(only_excel_ids)]
    
    # B. Only in DB
    only_db_ids = db_ids - excel_ids
    only_db = df_db_clean[df_db_clean['id_num'].isin(only_db_ids)]
    
    # 4. Reporting
    print(f"\n[!] IN EXCEL BUT NOT IN DB ({len(only_excel)})")
    print(f"[!] IN DB BUT NOT IN EXCEL ({len(only_db)})")

    if not only_excel.empty:
        only_excel.to_csv(os.path.join(OUTPUT_DIR, "only_in_excel.csv"), index=False)
        print(f"Details saved to '{OUTPUT_DIR}/only_in_excel.csv'")
    if not only_db.empty:
        only_db.to_csv(os.path.join(OUTPUT_DIR, "only_in_biometric.csv"), index=False)
        print(f"Details saved to '{OUTPUT_DIR}/only_in_biometric.csv'")

if __name__ == "__main__":
    main()
