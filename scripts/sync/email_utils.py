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

def send_late_arrival_email(to_email, user_name, arrival_time, shift_start, cc_email=None):
    """
    Sends an email notification when an employee arrives late.
    Can optionally send a copy (CC) to a supervisor.
    """
    if not all([SMTP_SERVER, SMTP_USER, SMTP_PASS, to_email]):
        print(f"⚠️ Email skip: SMTP not configured or no recipient for {user_name}")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = to_email
        if cc_email:
            msg['Cc'] = cc_email
        msg['Subject'] = f"Notificación de Llegada Tardía - {user_name}"

        body = f"""
        Hola {user_name},

        Te informamos que se ha registrado un marcaje de entrada tardío:

        - Fecha y Hora de Marcaje: {arrival_time.strftime('%Y-%m-%d %H:%M:%S')}
        - Hora de Entrada de tu Turno: {shift_start.strftime('%H:%M:%S')}

        Este correo es automático. Por favor, asegúrate de cumplir con el horario establecido.

        Saludos,
        Departamento de Recursos Humanos
        """
        msg.attach(MIMEText(body, 'plain'))

        # Los destinatarios finales deben incluir tanto el 'To' como el 'Cc'
        recipients = [to_email]
        if cc_email:
            recipients.append(cc_email)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, recipients, msg.as_string())
        
        log_msg = f"📧 Email enviado a {to_email}"
        if cc_email:
            log_msg += f" (con copia a {cc_email})"
        print(log_msg)
        return True
    except Exception as e:
        print(f"❌ Error al enviar email: {e}")
        return False
