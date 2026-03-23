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
from email_utils import send_late_arrival_email

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

def procesar_notificacion_tardanza(db_repo, cedula, timestamp):
    """Verifica si es tarde y envía el correo si aplica."""
    try:
        late_info = db_repo.get_late_arrival_info(cedula, timestamp)
        if late_info and late_info.get("es_tarde"):
            exito = send_late_arrival_email(
                late_info["email"],
                late_info["nombre"],
                timestamp,
                late_info["hora_entrada"]
            )
            # Loguear el resultado del envío
            db_repo.log_notification(
                late_info["usuario_id"], 
                "LLEGADA_TARDIA", 
                late_info["email"], 
                exito
            )
    except Exception as e:
        print(f"❌ Error en hilo de notificación: {e}")

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
                         
                         # Si es ENTRADA, verificamos tardanza para notificar
                         if estado == "ENTRADA":
                             hilo_notify = threading.Thread(
                                 target=procesar_notificacion_tardanza, 
                                 args=(db_repo, cedula, timestamp),
                                 daemon=True
                             )
                             hilo_notify.start()
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
