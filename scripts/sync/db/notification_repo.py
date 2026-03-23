import psycopg2
import datetime


class NotificationRepo:
    def __init__(self, db_url):
        self.db_url = db_url

    def get_late_arrival_info(self, cedula, timestamp):
        """
        Verifies if a punch is late and returns the info needed for the email.
        Includes escalation logic: if the user is the area manager,
        it looks up the email of the parent area manager.
        """
        try:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT
                            u.id, u.email, u.nombre,
                            t.hora_entrada, t.margen_tolerancia_min,
                            a.id as area_id, a.jefe_id, a.parent_id
                        FROM usuarios u
                        JOIN turnos t ON u.turno_id = t.id
                        LEFT JOIN areas a ON u.area_id = a.id
                        WHERE u.cedula = %s AND u.es_activo = True
                    """, (str(cedula),))

                    user_data = cur.fetchone()
                    if not user_data:
                        return None

                    u_id, email, nombre, hora_entrada, tolerancia, area_id, jefe_id, parent_id = user_data

                    if not hora_entrada:
                        return None

                    # Determine the supervisor email (escalation logic)
                    supervisor_email = None
                    target_jefe_id = None

                    if jefe_id and jefe_id != u_id:
                        # Normal case: user is not the area manager
                        target_jefe_id = jefe_id
                    elif parent_id:
                        # Escalation: user is area manager, look up parent area manager
                        cur.execute("SELECT jefe_id FROM areas WHERE id = %s", (parent_id,))
                        res_parent = cur.fetchone()
                        if res_parent:
                            target_jefe_id = res_parent[0]

                    if target_jefe_id and target_jefe_id != u_id:
                        cur.execute("SELECT email FROM usuarios WHERE id = %s", (target_jefe_id,))
                        res_email = cur.fetchone()
                        if res_email:
                            supervisor_email = res_email[0]

                    # Late arrival check
                    hora_marcaje = timestamp.time()
                    dt_base = datetime.datetime.combine(datetime.date.today(), hora_entrada)
                    entrada_con_tolerancia = (dt_base + datetime.timedelta(minutes=tolerancia or 0)).time()

                    if hora_marcaje > entrada_con_tolerancia:
                        return {
                            "usuario_id": u_id,
                            "email": email,
                            "nombre": nombre,
                            "hora_entrada": hora_entrada,
                            "es_tarde": True,
                            "supervisor_email": supervisor_email
                        }

                    return None
        except Exception as e:
            print(f"🔥 Error al verificar tardanza/supervisor: {e}")
            return None

    def log_notification(self, usuario_id, tipo, destinatario, exito):
        """Records the sending of a notification in the DB."""
        try:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO logs_notificaciones (usuario_id, tipo_notificacion, destinatario, enviado_exitosamente, fecha_envio)
                        VALUES (%s, %s, %s, %s, NOW())
                    """, (usuario_id, tipo, destinatario, exito))
                conn.commit()
        except Exception as e:
            print(f"🔥 Error al loguear notificación: {e}")
