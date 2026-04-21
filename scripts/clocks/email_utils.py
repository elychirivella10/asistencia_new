import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Cargar variables de entorno
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
load_dotenv(os.path.join(project_root, '.env'))

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM")

def send_late_arrival_email(supervisor_email, user_name, arrival_time, shift_start):
    """
    Sends an email notification to the supervisor when an employee arrives late.
    """
    if not all([SMTP_SERVER, SMTP_USER, SMTP_PASS, supervisor_email]):
        print(f"⚠️ Email skip: SMTP not configured or no supervisor for {user_name}")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = supervisor_email
        msg['Subject'] = f"Aviso de Llegada Tardía - {user_name}"

        body = f"""
Estimado Supervisor,

Le informamos que el empleado {user_name} ha registrado un marcaje de entrada tardío:

- Fecha y Hora de Marcaje: {arrival_time.strftime('%Y-%m-%d %H:%M:%S')}
- Hora de Entrada del Turno: {shift_start.strftime('%H:%M:%S')}

Este correo es un aviso automático generado por el sistema biométrico.

Saludos,
Sistema de Control de Asistencia
        """
        msg.attach(MIMEText(body, 'plain'))

        recipients = [supervisor_email]

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, recipients, msg.as_string())
        
        print(f"📧 Email de tardanza enviado a {supervisor_email}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar email: {e}")
        return False
