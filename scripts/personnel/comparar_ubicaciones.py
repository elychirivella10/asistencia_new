import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import unicodedata
import re
from difflib import get_close_matches, SequenceMatcher

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ODS_FILE = "PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods"
OUTPUT_DIR = "outputs"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def normalize_text(text):
    """Normalize text: uppercase, remove accents, and clean special chars."""
    if pd.isna(text) or text is None:
        return ""
    text = str(text).strip().upper()
    # Remove accents
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    # Clean special chars and multiple spaces
    text = re.sub(r'[^A-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_similarity(a, b):
    """Calculates string similarity ratio."""
    return SequenceMatcher(None, a, b).ratio()

def main():
    print(f"--- Starting Area/Location Comparison ---")
    
    # 1. Get unique locations from Excel
    print(f"Reading locations from Excel...")
    try:
        df_excel = pd.read_excel(ODS_FILE, engine="odf", sheet_name="Hoja1", header=6)
        loc_col = "UBICACIÓN FÍSICA"
        
        if loc_col not in df_excel.columns:
            print(f"Error: Column '{loc_col}' not found.")
            return
            
        excel_locations = df_excel[loc_col].dropna().unique().tolist()
        print(f"Total unique locations in Excel: {len(excel_locations)}")
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # 2. Get areas from Database
    print("Fetching areas from database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        df_db_areas = pd.read_sql("SELECT nombre FROM areas", conn)
        conn.close()
        db_areas = df_db_areas['nombre'].tolist()
        print(f"Total areas in Database: {len(db_areas)}")
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return

    # 3. Mapping and Comparison
    results = []
    db_mapping = {normalize_text(name): name for name in db_areas}
    normalized_db_names = list(db_mapping.keys())

    for loc in sorted(excel_locations):
        norm_loc = normalize_text(loc)
        if not norm_loc: continue
            
        match_type = "NO MATCH"
        suggested_name = ""
        score = 0
        
        # A. Exact Match (Normalized)
        if norm_loc in db_mapping:
            match_type = "EXACT"
            suggested_name = db_mapping[norm_loc]
            score = 1.0
        else:
            # B. Approximate Match
            matches = get_close_matches(norm_loc, normalized_db_names, n=1, cutoff=0.5)
            if matches:
                suggested_norm = matches[0]
                suggested_name = db_mapping[suggested_norm]
                score = calculate_similarity(norm_loc, suggested_norm)
                match_type = "SUGGESTED" if score > 0.6 else "NO MATCH"
        
        results.append({
            'Excel Location': loc,
            'DB Suggested Area': suggested_name if match_type != "NO MATCH" else "-",
            'Match Type': match_type,
            'Confidence': round(score, 2)
        })

    # 4. Generate Reports
    df_results = pd.DataFrame(results)
    match_order = {"EXACT": 0, "SUGGESTED": 1, "NO MATCH": 2}
    df_results['order'] = df_results['Match Type'].map(match_order)
    df_results = df_results.sort_values(['order', 'Confidence'], ascending=[True, False]).drop(columns=['order'])

    print("\n" + "="*70)
    print(f"AREA COMPARISON SUMMARY")
    print("="*70)
    summary = df_results['Match Type'].value_counts()
    for mtype, count in summary.items():
        print(f" - {mtype}: {count}")

    df_results.to_csv(os.path.join(OUTPUT_DIR, "area_comparison_full.csv"), index=False)
    print(f"\nFull report saved to: {OUTPUT_DIR}/area_comparison_full.csv")
    
    # Save suggestions and discrepancies
    df_pending = df_results[df_results['Match Type'].isin(["SUGGESTED", "NO MATCH"])]
    df_pending.to_csv(os.path.join(OUTPUT_DIR, "area_suggestions.csv"), index=False)
    print(f"Suggestions saved to {OUTPUT_DIR}/area_suggestions.csv ({len(df_pending)} records)")

if __name__ == "__main__":
    main()
