import os
import sys
from dotenv import load_dotenv

# Asegurar que cargamos el .env desde la raíz del proyecto
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
load_dotenv(os.path.join(project_root, '.env'))

DB_URL = os.getenv("DATABASE_URL", "").split('?')[0]
IP_RELOJ = os.getenv("BIOMETRICO_IP")
PUERTO = int(os.getenv("BIOMETRICO_PORT", 4370))
COMEDOR_IP = os.getenv("COMEDOR_IP")
COMEDOR_PORT = int(os.getenv("COMEDOR_PORT", 4370))

# Configuración de limpieza
DIAS_PARA_DEPURAR = int(os.getenv("DIAS_PARA_DEPURAR", 150000000000))
# Aseguramos que el log se guarde en la carpeta logs de la raíz
PATH_ULTIMA_LIMPIEZA = os.getenv("PATH_ULTIMA_LIMPIEZA", os.path.join(project_root, "logs", "last_clear.txt"))

# Configuración Monitor Realtime
DEVICE_ID = os.getenv("DISPOSITIVO_ID", "ZK_RELOJ_01")
COMEDOR_DEVICE_ID = os.getenv("COMEDOR_DISPOSITIVO_ID", "COMEDOR_01")

# Configuración Resumen (Valores por defecto)
HORA_ENTRADA_OFICIAL = os.getenv("HORA_ENTRADA_OFICIAL", "08:00:00")
MARGEN_TARDIA_MIN = int(os.getenv("MARGEN_TARDIA_MIN", 10))
MINUTOS_ESPERADOS_EN_FALTA_CERO = os.getenv("MINUTOS_ESPERADOS_EN_FALTA_CERO", "true").lower() == "true"
COMEDOR_DESCUENTA_MINUTOS = os.getenv("COMEDOR_DESCUENTA_MINUTOS", "true").lower() == "true"
COMEDOR_MAX_SESSION_MIN = int(os.getenv("COMEDOR_MAX_SESSION_MIN", 120))
COMEDOR_MAX_DAILY_MIN = int(os.getenv("COMEDOR_MAX_DAILY_MIN", 120))
