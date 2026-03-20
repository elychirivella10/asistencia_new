import os
import datetime

class CleanerService:
    def __init__(self, log_path, days_threshold):
        self.log_path = log_path
        self.days_threshold = days_threshold

    def should_clean(self):
        if not os.path.exists(self.log_path): 
            return True
        
        try:
            with open(self.log_path, "r") as f:
                fecha_str = f.read().strip()
                ultima_fecha = datetime.datetime.strptime(fecha_str, '%Y-%m-%d').date()
            
            dias_pasados = (datetime.date.today() - ultima_fecha).days
            return dias_pasados >= self.days_threshold
        except Exception as e:
            print(f"⚠️ Error leyendo log de limpieza: {e}")
            return True

    def register_success(self):
        directorio = os.path.dirname(self.log_path)
        if directorio and not os.path.exists(directorio):
            os.makedirs(directorio, exist_ok=True)
            
        with open(self.log_path, "w") as f:
            f.write(str(datetime.date.today()))
