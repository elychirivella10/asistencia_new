import psycopg2
import uuid


class AttendanceRepo:
    def __init__(self, db_url):
        self.db_url = db_url

    def sync_attendance(self, attendances, device_id, user_map):
        """
        Bulk-inserts raw attendance records, ignoring duplicates.
        Optimized with batch insert and pre-resolved user map.
        """
        if not attendances:
            return 0

        tipos_map = {0: "ENTRADA", 1: "SALIDA", 2: "S.COMER", 3: "E.COMER"}
        batch_data = []
        count = 0

        for record in attendances:
            b_id = str(record.user_id)
            if b_id in user_map:
                u_uuid = user_map[b_id]
                tipo = tipos_map.get(record.punch, "OTRO")
                batch_data.append((
                    str(uuid.uuid4()),
                    u_uuid,
                    record.timestamp,
                    tipo,
                    'SYNC_PROGRAMADO',
                    device_id
                ))
                count += 1

        if not batch_data:
            return 0

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO marcajes_brutos (
                        id, usuario_id, fecha_hora, tipo, origen, dispositivo_id, updated_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (usuario_id, fecha_hora) DO NOTHING;
                """
                cur.executemany(sql, batch_data)
            conn.commit()

        return count

    def register_live_attendance(self, cedula, timestamp, tipo_punch, device_id):
        """Inserts a real-time attendance record."""
        try:
            with psycopg2.connect(self.db_url, connect_timeout=5) as conn:
                with conn.cursor() as cur:
                    sql = """
                    INSERT INTO marcajes_brutos (id, usuario_id, fecha_hora, tipo, origen, dispositivo_id)
                    SELECT %s, id, %s, %s, 'BIOMETRICO_REALTIME', %s
                    FROM usuarios
                    WHERE cedula = %s
                    ON CONFLICT (usuario_id, fecha_hora) DO NOTHING;
                    """
                    id_log = str(uuid.uuid4())
                    cur.execute(sql, (id_log, timestamp, tipo_punch, device_id, str(cedula)))
                    return cur.rowcount > 0
        except Exception as e:
            print(f"🔥 Error al insertar en DB (Live): {e}")
            return False

    def get_all_punches_for_date(self, date):
        """
        Returns punch stats for ALL users on a given date.
        Optimized to avoid N+1 queries.
        Returns: Dict {user_id: (min_fecha, max_fecha, count)}
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT usuario_id, MIN(fecha_hora), MAX(fecha_hora), COUNT(*)
                    FROM marcajes_brutos
                    WHERE fecha_hora::date = %s
                    GROUP BY usuario_id
                """, (date,))
                return {row[0]: (row[1], row[2], row[3]) for row in cur.fetchall()}

    def get_daily_punches_stats(self, user_id, date):
        """Returns MIN, MAX and COUNT of punches for a user on a given date."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT MIN(fecha_hora), MAX(fecha_hora), COUNT(*)
                    FROM marcajes_brutos
                    WHERE usuario_id = %s AND fecha_hora::date = %s
                      AND tipo IN ('ENTRADA','SALIDA')
                """, (user_id, date))
                return cur.fetchone()

    def get_punches_for_user_on_date(self, user_id, target_date):
        """Returns all punches for a user on a given date."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT fecha_hora, tipo
                    FROM marcajes_brutos
                    WHERE usuario_id = %s AND fecha_hora::date = %s
                    ORDER BY fecha_hora ASC
                """, (user_id, target_date))
                return cur.fetchall()

    def get_punch_count_by_cedula(self, cedula, date):
        """Returns the number of punches for a user (by cedula) on a given date."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*)
                    FROM marcajes_brutos mb
                    JOIN usuarios u ON mb.usuario_id = u.id
                    WHERE u.cedula = %s AND mb.fecha_hora::date = %s
                """, (str(cedula), date))
                res = cur.fetchone()
                return res[0] if res else 0

    def ensure_comedor_table(self):
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS marcajes_comedor (
                        id uuid PRIMARY KEY,
                        usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
                        fecha_hora timestamptz NOT NULL,
                        dispositivo_id varchar(50),
                        origen varchar(20) DEFAULT 'COMEDOR',
                        updated_at timestamptz DEFAULT now()
                    );
                """)
                cur.execute("""
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_comedor_usuario_fecha
                    ON marcajes_comedor(usuario_id, fecha_hora);
                """)
            conn.commit()

    def sync_comedor_attendance(self, attendances, device_id, user_map):
        if not attendances:
            return 0
        self.ensure_comedor_table()
        batch_data = []
        invalidations = set()
        count = 0

        for record in attendances:
            b_id = str(record.user_id)
            if b_id in user_map:
                u_uuid = user_map[b_id]
                batch_data.append((
                    str(uuid.uuid4()),
                    u_uuid,
                    record.timestamp,
                    device_id
                ))
                count += 1
                invalidations.add((u_uuid, record.timestamp.date()))

        if not batch_data:
            return 0

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO marcajes_comedor (
                        id, usuario_id, fecha_hora, dispositivo_id, updated_at
                    )
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT (usuario_id, fecha_hora) DO NOTHING;
                """
                cur.executemany(sql, batch_data)
            conn.commit()

        if invalidations:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    sql = """
                        UPDATE resumen_diario
                        SET last_processed_at = NULL
                        WHERE usuario_id = %s AND fecha = %s
                    """
                    cur.executemany(sql, list(invalidations))
                conn.commit()

        return count

    def get_all_comedor_marks_for_date(self, date):
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT usuario_id, fecha_hora
                    FROM marcajes_comedor
                    WHERE fecha_hora::date = %s
                    ORDER BY usuario_id, fecha_hora
                """, (date,))
                data = {}
                for user_id, ts in cur.fetchall():
                    if user_id not in data:
                        data[user_id] = []
                    data[user_id].append(ts)
                return data
