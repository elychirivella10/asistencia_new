import sys
import os
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import COMEDOR_IP, COMEDOR_PORT, DB_URL, COMEDOR_DEVICE_ID
from zk_service import ZKService
from db_repository import DBRepository

def main():
    print(f"\n--- 🍽️ INICIANDO SYNC COMEDOR ({datetime.datetime.now().strftime('%H:%M:%S')}) ---")
    zk_service = ZKService(COMEDOR_IP, COMEDOR_PORT)
    db_repo = DBRepository(DB_URL)
    try:
        if not DB_URL or not COMEDOR_IP or not COMEDOR_PORT or not COMEDOR_DEVICE_ID:
            print("❌ Configuración inválida")
            return
        zk_service.connect()
        users_zk = zk_service.get_users()
        attendances = zk_service.get_attendance()
        print(f"✅ Datos comedor: {len(users_zk)} usuarios, {len(attendances)} marcajes.")
        inserted = db_repo.sync_comedor_attendance(attendances, COMEDOR_DEVICE_ID)
        print(f"💾 Insertados {inserted} marcajes de comedor.")
    except Exception as e:
        print(f"❌ Error durante el proceso de comedor: {e}")
    finally:
        zk_service.disconnect()

if __name__ == "__main__":
    main()
