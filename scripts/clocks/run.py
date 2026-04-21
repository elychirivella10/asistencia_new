import sys
import os
import datetime

# Hack para importar módulos hermanos cuando se ejecuta como script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import IP_RELOJ, PUERTO, DB_URL, DIAS_PARA_DEPURAR, PATH_ULTIMA_LIMPIEZA, DEVICE_ID
from zk_service import ZKService
from db_repository import DBRepository
from cleaner import CleanerService

def main():
    print(f"\n--- 🔄 INICIANDO SYNC COMPLETA ({datetime.datetime.now().strftime('%H:%M:%S')}) ---")
    
    # Inicializar servicios
    zk_service = ZKService(IP_RELOJ, PUERTO)
    db_repo = DBRepository(DB_URL)
    cleaner = CleanerService(PATH_ULTIMA_LIMPIEZA, DIAS_PARA_DEPURAR)
    
    try:
        if not DB_URL or not IP_RELOJ or not PUERTO:
            print("❌ Configuración inválida")
            return
        # 1. Conectar al reloj
        zk_service.connect()
        
        # 2. Obtener datos
        users_zk = zk_service.get_users()
        attendances = zk_service.get_attendance()
        
        print(f"✅ Datos obtenidos: {len(users_zk)} usuarios, {len(attendances)} marcajes.")
        
        if not attendances:
            print("👍 No hay nuevos marcajes para sincronizar.")
        else:
            # 3. Sincronizar Usuarios
            existing_ids = db_repo.get_existing_biometric_ids()
            for u_zk in users_zk:
                if str(u_zk.user_id) not in existing_ids:
                    db_repo.create_user(u_zk)
            
            # 4. Sincronizar Marcajes
            db_repo.sync_attendance(attendances, DEVICE_ID)
            print("✨ Sincronización con Base de Datos completada.")

            # 5. Limpieza (Si corresponde)
            # if cleaner.should_clean():
            #     print(f"🧹 Ciclo de {DIAS_PARA_DEPURAR} días cumplido. Limpiando memoria del reloj...")
            #     zk_service.clear_attendance()
            #     cleaner.register_success()
            #     print("✨ Memoria del reloj liberada.")
            
    except Exception as e:
        print(f"❌ Error durante el proceso: {e}")
    finally:
        # Asegurar cierre de conexión
        zk_service.disconnect()

if __name__ == "__main__":
    main()
