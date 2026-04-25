import sys
import os
import argparse
import psycopg2
from datetime import datetime

# Hack para importar módulos hermanos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import IP_RELOJ, PUERTO, DB_URL
from zk_service import ZKService
from db_repository import DBRepository

def main():
    parser = argparse.ArgumentParser(description="Mando de Gestión Biométrica")
    parser.add_argument("--action", required=True, choices=["push-user", "push-all-users", "delete-finger", "delete-user", "sync-templates", "total-sync"], help="Acción a realizar")
    parser.add_argument("--id", help="ID Biométrico del usuario")
    parser.add_argument("--finger", type=int, help="Índice del dedo (0-9)")

    args = parser.parse_args()
    
    zk = ZKService(IP_RELOJ, PUERTO)
    db = DBRepository(DB_URL)
    
    try:
        zk.connect()
        zk.disable_device() # Pausar reloj para evitar conflictos
        
        if args.action == "push-user":
            if not args.id: raise Exception("Se requiere --id")
            user_data = db.get_user_by_biometric_id(args.id)
            if not user_data:
                print(f"❌ Error: Usuario {args.id} no encontrado en la base de datos.")
                return
            
            b_id, nombre, apellido = user_data
            full_name = f"{nombre} {apellido}".strip()[:24] # Límite de ZK
            
            print(f"🚀 Enviando usuario al reloj: {full_name} (ID: {b_id})...")
            zk.set_user(user_id=b_id, name=full_name)
            print("✅ Usuario creado/actualizado en el dispositivo.")

        elif args.action == "push-all-users":
            print("🚀 Iniciando subida inteligente de usuarios (Web -> Reloj)...")
            all_users = db.get_all_users_for_sync()
            
            print("📦 Analizando datos actuales en el dispositivo...")
            zk_users = zk.get_users()
            # Mapa de lo que ya tiene el reloj: {user_id: name}
            zk_map = {str(u.user_id): u.name for u in zk_users}
            user_id_to_uid = {str(u.user_id): u.uid for u in zk_users}

            stats = {"created": 0, "updated": 0, "skipped": 0}

            for b_id, nombre, apellido in all_users:
                full_name = f"{nombre} {apellido}".strip()[:24]
                b_id_str = str(b_id)
                
                # ¿Ya existe con el mismo nombre?
                if b_id_str in zk_map and zk_map[b_id_str] == full_name:
                    stats["skipped"] += 1
                    continue
                
                uid = user_id_to_uid.get(b_id_str)
                if uid is None:
                    try:
                        val = int(b_id)
                        uid = val if val < 30000 else (val % 30000)
                    except: uid = 1
                    stats["created"] += 1
                else:
                    stats["updated"] += 1
                
                print(f"  -> {'Actualizando' if b_id_str in zk_map else 'Creando'}: {full_name} (ID: {b_id})")
                zk.conn.set_user(uid=uid, name=full_name, user_id=b_id_str, privilege=0)
            
            print(f"✅ Proceso finalizado. Saltados: {stats['skipped']}, Creados: {stats['created']}, Actualizados: {stats['updated']}.")

        elif args.action == "delete-finger":
            if not args.id or args.finger is None: raise Exception("Se requiere --id y --finger")
            print(f"🗑️ Borrando huella {args.finger} del usuario {args.id}...")
            
            # 1. Borrar del reloj
            zk.delete_user_template(user_id=args.id, finger_index=args.finger)
            
            # 2. Borrar de la base de datos
            # Necesitamos el UUID interno del usuario para borrar de la tabla huellas
            user_map = db.get_users_map_by_biometric_id()
            u_uuid = user_map.get(str(args.id))
            if u_uuid:
                db.delete_fingerprints(user_id=u_uuid, finger_index=args.finger)
                print(f"✅ Huella borrada del reloj y de la base de datos.")
            else:
                print(f"⚠️ Huella borrada del reloj, pero el usuario no está en la BD.")

        elif args.action == "delete-user":
            if not args.id: raise Exception("Se requiere --id")
            print(f"🔥 Borrando usuario {args.id} completamente del reloj...")
            zk.delete_user(user_id=args.id)
            print("✅ Usuario eliminado del dispositivo.")

        elif args.action == "sync-templates":
            print("🔄 Sincronizando huellas desde el reloj...")
            
            # 1. Mapeo de IDs desde el reloj
            users_zk = zk.get_users()
            uid_to_userid = {u.uid: str(u.user_id) for u in users_zk}
            
            # 2. Sincronizar templates
            templates = zk.get_templates()
            user_map = db.get_users_map_by_biometric_id()
            
            count = 0
            # Usamos una sola conexión para todo el lote
            with psycopg2.connect(DB_URL) as conn:
                for t in templates:
                    internal_uid = getattr(t, 'uid', None)
                    user_id_str = uid_to_userid.get(internal_uid)
                    if not user_id_str: continue
                    
                    fid = getattr(t, 'fid', getattr(t, 'temp_id', 0))
                    u_uuid = user_map.get(user_id_str)
                    
                    if u_uuid:
                        db.save_fingerprint(user_id=u_uuid, finger_index=fid, template=t.template, conn=conn)
                        count += 1
                conn.commit()
            
            print(f"✅ Sincronización finalizada: {count} huellas guardadas en la base de datos.")

        elif args.action == "total-sync":
            print("🔄 INICIANDO SINCRONIZACIÓN TOTAL (Subida + Bajada)...")
            
            # 1. Preparar datos
            print("📦 Preparando comunicación con el dispositivo...")
            zk_users = zk.get_users()
            zk_map = {str(u.user_id): u.name for u in zk_users}
            user_id_to_uid = {str(u.user_id): u.uid for u in zk_users}
            uid_to_userid = {u.uid: str(u.user_id) for u in zk_users}
            
            # Usamos una sola conexión para todas las operaciones de DB
            with psycopg2.connect(DB_URL) as conn:
                # 2. Subir usuarios (Web -> Reloj) de forma inteligente
                print("📤 Sincronizando usuarios...")
                all_users = db.get_all_users_for_sync()
                push_count = 0
                for b_id, nombre, apellido in all_users:
                    full_name = f"{nombre} {apellido}".strip()[:24]
                    b_id_str = str(b_id)
                    
                    # Saltar si ya está al día
                    if b_id_str in zk_map and zk_map[b_id_str] == full_name:
                        continue
                        
                    uid = user_id_to_uid.get(b_id_str)
                    if uid is None:
                        try:
                            val = int(b_id); uid = val if val < 30000 else (val % 30000)
                        except: uid = 1
                    
                    zk.conn.set_user(uid=uid, name=full_name, user_id=b_id_str)
                    push_count += 1
                print(f"✅ {push_count} usuarios actualizados/creados en el reloj.")

                # 3. Bajar huellas (Reloj -> Web)
                print("📥 Descargando respaldos de huellas...")
                templates = zk.get_templates()
                user_map = db.get_users_map_by_biometric_id()
                
                count = 0
                for t in templates:
                    internal_uid = getattr(t, 'uid', None)
                    user_id_str = uid_to_userid.get(internal_uid)
                    if not user_id_str: continue
                    
                    fid = getattr(t, 'fid', getattr(t, 'temp_id', 0))
                    u_uuid = user_map.get(user_id_str)
                    if u_uuid:
                        db.save_fingerprint(user_id=u_uuid, finger_index=fid, template=t.template, conn=conn)
                        count += 1
                conn.commit()
            
            print(f"✅ {count} huellas respaldadas en la base de datos.")
            print("✨ SINCRONIZACIÓN TOTAL COMPLETADA.")

        zk.refresh_data()
        zk.enable_device()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        zk.disconnect()

if __name__ == "__main__":
    main()
