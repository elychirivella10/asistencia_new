import time
import datetime
import threading
import sys
import os

# Hack para importar módulos hermanos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import DB_URL, IP_RELOJ, PUERTO, DEVICE_ID
from zk_service import ZKService
from db_repository import DBRepository

# Bandera global para controlar hilos
monitor_running = True

def mantener_vivo(zk_service):
    """Hilo secundario: Pide la hora al reloj cada 30 seg para evitar el timeout."""
    print("💓 Heartbeat iniciado (Keep-alive).")
    while monitor_running:
        try:
            if zk_service.get_time(): 
                time.sleep(30)
            else:
                break
        except:
            print("💔 Heartbeat detenido (Error conexión).")
            break

def iniciar_monitor():
    global monitor_running
    tipos_punch = {
        0: "ENTRADA",
        1: "SALIDA",
        2: "SALIDA_COMER",
        3: "ENTRADA_COMER",
        4: "ENTRADA_EXTRA",
        5: "SALIDA_EXTRA"
    }

    db_repo = DBRepository(DB_URL)

    while True: # Bucle de vida para PM2
        zk_service = ZKService(IP_RELOJ, PUERTO, timeout=10)
        
        try:
            zk_service.connect()
            zk_service.enable_device()
            
            # Lanzamos el hilo de mantenimiento
            hilo_ping = threading.Thread(target=mantener_vivo, args=(zk_service,), daemon=True)
            hilo_ping.start()

            print("🚀 MONITOR ACTIVO: Escuchando eventos en tiempo real...")

            # Bucle de captura
            for attendance in zk_service.live_capture():
                if attendance is not None:
                    cedula = attendance.user_id
                    timestamp = attendance.timestamp
                    estado = tipos_punch.get(attendance.punch, "INDETERMINADO")

                    print(f"🔔 Evento: 👤 {cedula} | 🕒 {timestamp} | 📍 {estado}")
                    
                    if db_repo.register_live_attendance(cedula, timestamp, estado, DEVICE_ID):
                         print(f"✅ DB: Guardado -> Cédula: {cedula}")
                    else:
                         print(f"⚠️ DB: Omitido (Duplicado o no existe)")

        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            print("⏳ Reintentando conexión en 20 segundos...")
            time.sleep(20)
        
        finally:
            zk_service.disconnect()
            print("🔌 Socket liberado.")

if __name__ == "__main__":
    iniciar_monitor()
