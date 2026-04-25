from zk import ZK
import datetime

class ZKService:
    def __init__(self, ip, port, timeout=60):
        self.ip = ip
        self.port = port
        self.timeout = timeout
        self.zk = ZK(ip, port=port, timeout=timeout, force_udp=False)
        self.conn = None

    def connect(self):
        print(f"\n📡 Conectando al biométrico en {self.ip}:{self.port}...")
        self.conn = self.zk.connect()
        return self.conn

    def disconnect(self):
        if self.conn:
            try:
                self.conn.disconnect()
                print("🔌 Desconectado del biométrico.")
            except:
                pass

    def disable_device(self):
        if self.conn:
            self.conn.disable_device()

    def enable_device(self):
        if self.conn:
            self.conn.enable_device()

    def get_users(self):
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        return self.conn.get_users()

    def get_attendance(self):
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        return self.conn.get_attendance()

    def clear_attendance(self):
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        print("🧹 Ejecutando comando de limpieza en el reloj...")
        self.conn.clear_attendance()

    def live_capture(self):
        """Generador para eventos en tiempo real"""
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        return self.conn.live_capture()
    
    def get_time(self):
        """Obtiene la hora del reloj (útil para keep-alive)"""
        if self.conn:
            return self.conn.get_time()
        return None

    def _find_uid_by_user_id(self, user_id):
        """Busca el índice interno (UID) del reloj basándose en el ID de usuario (string)."""
        users = self.get_users()
        user_id_str = str(user_id)
        for u in users:
            if str(u.user_id) == user_id_str:
                return u.uid
        return None

    def set_user(self, user_id, name, privilege=0, password='', group_id='1', card=0):
        """Crea o actualiza un usuario en el biométrico."""
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        
        # Intentamos buscar el UID si ya existe
        uid = self._find_uid_by_user_id(user_id)
        
        # Si no existe, usamos los últimos 4 dígitos del user_id como UID sugerido (dentro del rango -32768 a 32767)
        # O mejor, un número secuencial si es nuevo. Por ahora, si es < 30000 lo usamos, sino buscamos el siguiente libre.
        if uid is None:
            try:
                candidate = int(user_id)
                uid = candidate if candidate < 30000 else (candidate % 30000)
            except:
                uid = 1 # Fallback
            
        print(f"DEBUG: Usando UID {uid} para UserID {user_id}")
        return self.conn.set_user(uid=uid, name=name, privilege=privilege, password=password, group_id=group_id, user_id=str(user_id), card=card)

    def delete_user(self, user_id):
        """Borra un usuario completamente del biométrico."""
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        
        uid = self._find_uid_by_user_id(user_id)
        if uid is None:
            print(f"⚠️ El usuario {user_id} no existe en el reloj.")
            return False
            
        try:
            # Intento estándar (Protocolo completo)
            return self.conn.delete_user(uid=uid, user_id=str(user_id))
        except Exception:
            # Fallback seguro (Solo UID numérico)
            print(f"⚠️ Error de protocolo, usando fallback de UID para borrar usuario {user_id}")
            return self.conn.delete_user(uid=uid)

    def delete_user_template(self, user_id, finger_index):
        """Borra la huella de un dedo específico para un usuario."""
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        
        uid = self._find_uid_by_user_id(user_id)
        if uid is None:
            # Fallback: si no hay UID, intentamos usar el ID de usuario si es pequeño
            try:
                val = int(user_id)
                if val < 30000: uid = val
            except: pass
            
        if uid is None:
            raise Exception(f"No se pudo encontrar el índice interno para el usuario {user_id}")

        try:
            # Intento estándar
            return self.conn.delete_user_template(uid=uid, temp_id=finger_index, user_id=str(user_id))
        except Exception:
            # Fallback seguro (Solo UID y Dedo)
            print(f"⚠️ Error de protocolo, usando fallback de UID para borrar huella de {user_id}")
            return self.conn.delete_user_template(uid=uid, temp_id=finger_index)

    def get_templates(self):
        """Obtiene todos los templates de huellas del dispositivo."""
        if not self.conn:
            raise Exception("No hay conexión con el dispositivo")
        return self.conn.get_templates()

    def refresh_data(self):
        """Refresca la data del dispositivo (necesario tras cambios masivos)."""
        if self.conn:
            self.conn.refresh_data()
