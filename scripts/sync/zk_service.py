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
