import pandas as pd
import os

files = ["solo_en_excel.csv", "solo_en_biometrico.csv"]

for f in files:
    if os.path.exists(f):
        df = pd.read_csv(f)
        print(f"{f}: {len(df)} registros")
        print("Primeros 5:")
        print(df.head())
        print("-" * 20)
    else:
        print(f"{f} no existe")
