import pandas as pd

file_path = "PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods"
try:
    df = pd.read_excel(file_path, engine="odf", sheet_name="Hoja1", header=6)
    col_ubicacion = "UBICACIÓN FÍSICA"
    if col_ubicacion in df.columns:
        unique_ubicaciones = df[col_ubicacion].dropna().unique().tolist()
        print(f"Ubicaciones únicas en Excel ({len(unique_ubicaciones)}):")
        for u in sorted(unique_ubicaciones):
            print(f" - {u}")
    else:
        print(f"Columna '{col_ubicacion}' no encontrada.")
        print(f"Columnas disponibles: {df.columns.tolist()}")
except Exception as e:
    print(f"Error: {e}")
