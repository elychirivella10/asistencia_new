import pandas as pd
import os

file_path = "PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods"

try:
    # Load the ODS file
    ods = pd.ExcelFile(file_path, engine="odf")
    print(f"Sheets found: {ods.sheet_names}")
    
    for sheet_name in ods.sheet_names:
        print(f"\n--- Inspecting sheet: {sheet_name} ---")
        # Read the first 9 rows without any header
        df = pd.read_excel(file_path, engine="odf", sheet_name=sheet_name, nrows=9, header=None)
        
        for i, row in df.iterrows():
            print(f"Row {i}: {row.tolist()[:10]}") # First 10 columns are enough
                
except Exception as e:
    print(f"Error reading ODS: {e}")
                
except Exception as e:
    print(f"Error reading ODS: {e}")
