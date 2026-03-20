import os
from datetime import date
from db_repository import DBRepository
from config import DB_URL

def verify_update():
    db_repo = DBRepository(DB_URL)
    cedula = '123456789'
    user = db_repo.get_user_by_cedula(cedula)
    
    if not user:
        print(f"Usuario con cédula {cedula} no encontrado.")
        return

    user_id = user[0]
    print(f"Verificando para usuario: {user[1]} {user[2]} (ID: {user_id})\n")

    dates_to_check = [date(2026, 3, 18), date(2026, 3, 19)]

    for target_date in dates_to_check:
        summary = db_repo.get_daily_summary_for_user_and_date(user_id, target_date)
        print(f"--- Resumen Diario ({target_date}) ---")
        if summary:
            print(f"  - Minutos Trabajados: {summary[3]}")
            print(f"  - Minutos Esperados: {summary[5]}")
            print(f"  - Saldo Minutos: {summary[7]}")
            print(f"  - Estado: {summary[11]}")
            print(f"  - Observaciones: {summary[13]}")
        else:
            print("  - No se encontró resumen diario.")

if __name__ == "__main__":
    verify_update()
