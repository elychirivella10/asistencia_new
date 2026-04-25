import psycopg2
import bcrypt


class UserRepo:
    def __init__(self, db_url):
        self.db_url = db_url

    def get_existing_biometric_ids(self):
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id FROM usuarios WHERE biometric_id IS NOT NULL")
                return {row[0] for row in cur.fetchall()}

    def get_users_map_by_biometric_id(self):
        """Returns a dict {biometric_id: usuario_id (uuid)}"""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id, id FROM usuarios WHERE biometric_id IS NOT NULL")
                return {row[0]: row[1] for row in cur.fetchall()}

    def get_users_with_shifts(self):
        """Returns active users with shift info."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, u.nombre, t.hora_entrada, t.hora_salida, t.margen_tolerancia_min, t.dias_laborales, t.id
                    FROM usuarios u
                    LEFT JOIN turnos t ON u.turno_id = t.id
                    WHERE u.es_activo = True
                """)
                return cur.fetchall()

    def get_users_with_active_multi_day_shifts(self):
        """Returns users with shifts that cross midnight."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, t.hora_entrada, t.hora_salida
                    FROM usuarios u
                    JOIN turnos t ON u.turno_id = t.id
                    WHERE u.es_activo = True AND t.cruza_medianoche = TRUE
                """)
                return cur.fetchall()

    def get_user_by_cedula(self, cedula):
        """Returns a user by their cedula number."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, nombre, apellido FROM usuarios WHERE cedula = %s", (cedula,))
                return cur.fetchone()

    def get_shift_details_for_user_on_date(self, user_id, date):
        """
        Returns shift details for a user on a given date,
        including whether the shift crosses midnight.
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        t.id,
                        t.hora_entrada,
                        t.hora_salida,
                        t.margen_tolerancia_min,
                        t.dias_laborales,
                        t.cruza_medianoche,
                        t.nombre
                    FROM usuarios u
                    JOIN turnos t ON u.turno_id = t.id
                    WHERE u.id = %s
                """, (str(user_id),))
                return cur.fetchone()

    def create_user(self, user_zk):
        """
        Creates a new user if not found.
        Checks for cedula/biometric_id duplicates and generates a password.
        """
        b_id = str(user_zk.user_id)
        name = user_zk.name or "Nuevo"
        cedula = b_id  # Default: cedula = biometric_id
        email = f"user_{b_id}@empresa.com"  # Placeholder

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id FROM usuarios
                    WHERE biometric_id = %s OR cedula = %s
                """, (b_id, cedula))

                if cur.fetchone():
                    return  # Already exists, skip silently

                hashed_pw = bcrypt.hashpw(cedula.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

                print(f"✨ Auto-creando usuario: {name} (ID: {b_id})")
                cur.execute("""
                    INSERT INTO usuarios (
                        id, nombre, apellido, email, biometric_id, cedula,
                        es_activo, rol_id, turno_id, password, created_at
                    )
                    VALUES (
                        gen_random_uuid(), %s, '', %s, %s, %s,
                        True,
                        (SELECT id FROM roles WHERE nombre = 'EMPLEADO' LIMIT 1),
                        (SELECT id FROM turnos LIMIT 1),
                        %s, NOW()
                    )
                """, (name, email, b_id, cedula, hashed_pw))
            conn.commit()

    def save_fingerprint(self, user_id, finger_index, template, version=10, conn=None):
        """Saves or updates a fingerprint template for a user. Can reuse a connection."""
        sql = """
            INSERT INTO huellas_biometricas (id, usuario_id, finger_index, template, version, created_at)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW())
            ON CONFLICT (usuario_id, finger_index) 
            DO UPDATE SET template = EXCLUDED.template, version = EXCLUDED.version, created_at = NOW()
        """
        params = (str(user_id), finger_index, template, version)

        if conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
        else:
            with psycopg2.connect(self.db_url) as new_conn:
                with new_conn.cursor() as cur:
                    cur.execute(sql, params)
                new_conn.commit()

    def get_user_fingerprints(self, user_id):
        """Retrieves all fingerprints for a specific user."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT finger_index, template, version FROM huellas_biometricas
                    WHERE usuario_id = %s
                """, (str(user_id),))
                return cur.fetchall()

    def delete_fingerprints(self, user_id, finger_index=None):
        """Deletes one or all fingerprints for a user in the DB."""
        query = "DELETE FROM huellas_biometricas WHERE usuario_id = %s"
        params = [str(user_id)]
        
        if finger_index is not None:
            query += " AND finger_index = %s"
            params.append(finger_index)
            
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(query, tuple(params))
            conn.commit()

    def get_user_by_biometric_id(self, b_id):
        """Returns biometric_id and full name for a user."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id, nombre, apellido FROM usuarios WHERE biometric_id = %s", (str(b_id),))
                return cur.fetchone()

    def get_all_users_for_sync(self):
        """Returns all active users with biometric_id for mass synchronization."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id, nombre, apellido FROM usuarios WHERE es_activo = True AND biometric_id IS NOT NULL")
                return cur.fetchall()
