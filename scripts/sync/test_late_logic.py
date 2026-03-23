import datetime
import sys
import os

# Hack para importar módulos hermanos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db_repository import DBRepository
from config import DB_URL

def test_late_logic():
    db_repo = DBRepository(DB_URL)
    
    # 1. Obtener un usuario de prueba (asumimos que existe uno con cedula '12345678')
    # Si no, buscaremos el primero disponible.
    with db_repo.psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT cedula, nombre FROM usuarios WHERE turno_id IS NOT NULL LIMIT 1")
            row = cur.fetchone()
            if not row:
                print("❌ No hay usuarios con turno para probar.")
                return
            cedula = row[0]
            nombre = row[1]
            print(f"🧪 Probando con usuario: {nombre} (Cédula: {cedula})")

    # 2. Simular un marcaje de hoy a las 23:59 (seguro es tarde para cualquier turno)
    test_ts = datetime.datetime.now().replace(hour=23, minute=59, second=0)
    
    print(f"🕒 Simulando marcaje a las: {test_ts}")
    late_info = db_repo.get_late_arrival_info(cedula, test_ts)
    
    if late_info and late_info.get("es_tarde"):
        print("✅ Lógica de detección de tardanza: FUNCIONA")
        print(f"ℹ️ Info: {late_info}")
    else:
        print("❌ Lógica de detección de tardanza: NO FUNCIONA (o el turno tiene una hora de entrada muy extraña)")

if __name__ == "__main__":
    # Necesitamos que db_repo tenga acceso a psycopg2 si usamos el snippet de arriba directamente
    # Pero db_repo ya lo importa. 
    import psycopg2
    DBRepository.psycopg2 = psycopg2 
    test_late_logic()
