import pandas as pd
import unicodedata
import re

# Redefinition of simple logic to find dups
def normalize_simple(text):
    if pd.isna(text) or text is None: return ""
    text = str(text).strip().upper()
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    return text

def parse_name_smart(full_name):
    text = normalize_simple(full_name)
    parts = [p for p in text.split() if len(p) > 1]
    if not parts: return "NUEVO", "USUARIO"
    first_name = parts[0]
    last_name = ""
    if len(parts) == 2: last_name = parts[1]
    elif len(parts) >= 3:
        connectors = {"DE", "DEL", "LA", "LAS", "LOS", "Y"}
        idx = 2
        while idx < len(parts) and parts[idx] in connectors: idx += 1
        if idx < len(parts): last_name = parts[idx]
        else: last_name = parts[1]
    else: last_name = parts[0]
    return first_name, last_name

df = pd.read_excel('PERSONAL ACTIVO AL 13 04 2026 - TEGNOLOGIA.ods', engine='odf', sheet_name='Hoja1', header=6)
emails = []
for i, row in df.iterrows():
    n = row['   NOMBRES Y APELLIDOS']
    if pd.isna(n): continue
    fn, ln = parse_name_smart(n)
    emails.append(f"{fn.lower()}.{ln.lower()}@sapi.gob.ve")

s = pd.Series(emails)
dups = s[s.duplicated(keep=False)].sort_values()
print("DUPLICATE EMAILS FOUND:")
print(dups.unique())
print("\nCOUNT PER EMAIL:")
print(dups.value_counts())
