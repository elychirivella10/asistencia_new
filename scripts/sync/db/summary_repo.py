import psycopg2


class SummaryRepo:
    def __init__(self, db_url):
        self.db_url = db_url

    def get_unprocessed_dates(self):
        """
        Identifies dates that need to be processed.
        Includes: new punches, current day, and manual invalidations (NULL).
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    -- 1. Dates with new punches or activity today
                    SELECT DISTINCT mb.fecha_hora::date
                    FROM marcajes_brutos mb
                    LEFT JOIN resumen_diario rd ON mb.fecha_hora::date = rd.fecha
                    WHERE rd.id IS NULL
                       OR mb.updated_at > rd.last_processed_at
                       OR mb.fecha_hora::date = CURRENT_DATE

                    UNION

                    -- 2. Dates manually invalidated from web (last_processed_at IS NULL)
                    SELECT DISTINCT fecha
                    FROM resumen_diario
                    WHERE last_processed_at IS NULL

                    ORDER BY 1 ASC;
                """)
                return [row[0] for row in cur.fetchall()]

    def get_all_novelties_for_date(self, date):
        """
        Returns all active novelties for a given date.
        Returns: Dict {user_id: {tipo, es_dia_completo, hora_inicio, hora_fin}}
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT n.usuario_id, c.nombre, n.es_dia_completo, n.hora_inicio, n.hora_fin
                    FROM novedades n
                    JOIN cat_tipos_permiso c ON n.tipo_id = c.id
                    WHERE %s BETWEEN n.fecha_inicio AND n.fecha_fin
                    AND n.estado = 'APROBADO'
                """, (date,))

                result = {}
                for row in cur.fetchall():
                    result[row[0]] = {
                        "tipo": row[1],
                        "es_dia_completo": row[2],
                        "hora_inicio": row[3],
                        "hora_fin": row[4]
                    }
                return result

    def get_holiday_or_novelty(self, user_id, date):
        """Looks up if there is a holiday or novelty (permit/vacation) for the day."""
        feriado = None
        novedad = None

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT descripcion FROM feriados WHERE fecha = %s", (date,))
                res_f = cur.fetchone()
                if res_f:
                    feriado = res_f[0]

                cur.execute("""
                    SELECT c.nombre, n.es_dia_completo, n.hora_inicio, n.hora_fin
                    FROM novedades n
                    JOIN cat_tipos_permiso c ON n.tipo_id = c.id
                    WHERE n.usuario_id = %s AND %s BETWEEN n.fecha_inicio AND n.fecha_fin
                    AND n.estado = 'APROBADO' LIMIT 1
                """, (user_id, date))
                res_n = cur.fetchone()
                if res_n:
                    novedad = {
                        "tipo": res_n[0],
                        "es_dia_completo": res_n[1],
                        "hora_inicio": res_n[2],
                        "hora_fin": res_n[3]
                    }

        return feriado, novedad

    def get_holiday_for_date(self, date):
        """Returns the holiday description if it exists for the given date."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT descripcion FROM feriados WHERE fecha = %s", (date,))
                res = cur.fetchone()
                return res[0] if res else None

    def get_novelty_types_map(self):
        """
        Returns a map of {nombre: slug} to normalize states.
        Allows the script to be 100% dynamic.
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT tp.nombre, mpe.estado_slug
                    FROM cat_tipos_permiso tp
                    JOIN cat_tipos_permiso_estado mpe ON mpe.tipo_id = tp.id
                """)
                return {row[0].lower(): row[1].lower() for row in cur.fetchall()}

    def get_daily_summary_for_user_and_date(self, user_id, date):
        """Returns the daily summary for a user on a specific date."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        fecha, hora_entrada, hora_salida,
                        minutos_trabajados, extras_informativas_min, minutos_esperados,
                        minutos_debe, saldo_minutos, permiso_parcial_min,
                        minutos_trabajados_neto, comedor_descuento_min, estado,
                        notificado_tardia, observaciones, llegada_slug, salida_slug,
                        es_incompleto, estado_excepcion_slug
                    FROM resumen_diario
                    WHERE usuario_id = %s AND fecha = %s
                """, (str(user_id), date))
                return cur.fetchone()

    def batch_upsert_daily_summary(self, records):
        """
        Bulk-inserts or updates daily summary records in a single transaction.
        records: List of tuples per batch_upsert_daily_summary signature.
        """
        if not records:
            return

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO resumen_diario (
                        usuario_id, fecha, hora_entrada, hora_salida,
                        minutos_trabajados, extras_informativas_min, minutos_esperados, minutos_debe, saldo_minutos, permiso_parcial_min, minutos_trabajados_neto, comedor_descuento_min, estado, notificado_tardia,
                        observaciones, llegada_slug, salida_slug, es_incompleto, estado_excepcion_slug, last_processed_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (usuario_id, fecha) DO UPDATE SET
                        hora_entrada = EXCLUDED.hora_entrada,
                        hora_salida = EXCLUDED.hora_salida,
                        minutos_trabajados = EXCLUDED.minutos_trabajados,
                        extras_informativas_min = EXCLUDED.extras_informativas_min,
                        minutos_esperados = EXCLUDED.minutos_esperados,
                        minutos_debe = EXCLUDED.minutos_debe,
                        saldo_minutos = EXCLUDED.saldo_minutos,
                        permiso_parcial_min = EXCLUDED.permiso_parcial_min,
                        minutos_trabajados_neto = EXCLUDED.minutos_trabajados_neto,
                        comedor_descuento_min = EXCLUDED.comedor_descuento_min,
                        estado = EXCLUDED.estado,
                        notificado_tardia = EXCLUDED.notificado_tardia,
                        observaciones = EXCLUDED.observaciones,
                        llegada_slug = EXCLUDED.llegada_slug,
                        salida_slug = EXCLUDED.salida_slug,
                        es_incompleto = EXCLUDED.es_incompleto,
                        estado_excepcion_slug = EXCLUDED.estado_excepcion_slug,
                        last_processed_at = NOW();
                """
                cur.executemany(sql, records)
            conn.commit()

    def update_daily_summary_for_multi_day(self, user_id, target_date, minutes_worked, minutes_expected, entry_time, exit_time):
        """Updates a resumen_diario record with multi-day session data."""
        saldo = minutes_worked - minutes_expected
        debe = max(0, -saldo)
        estado = "asistencia" if minutes_worked > 0 else "falta"
        observacion = "Procesado como parte de turno multi-día"

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO resumen_diario (
                        usuario_id, fecha, minutos_trabajados, minutos_esperados,
                        saldo_minutos, minutos_debe, estado, observaciones,
                        hora_entrada, hora_salida, last_processed_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (usuario_id, fecha) DO UPDATE SET
                        minutos_trabajados = EXCLUDED.minutos_trabajados,
                        minutos_esperados = EXCLUDED.minutos_esperados,
                        saldo_minutos = EXCLUDED.saldo_minutos,
                        minutos_debe = EXCLUDED.minutos_debe,
                        estado = EXCLUDED.estado,
                        observaciones = EXCLUDED.observaciones,
                        hora_entrada = EXCLUDED.hora_entrada,
                        hora_salida = EXCLUDED.hora_salida,
                        last_processed_at = NOW();
                """, (user_id, target_date, minutes_worked, minutes_expected, saldo, debe, estado, observacion, entry_time, exit_time))

    def get_multi_day_shift_summary_for_date(self, user_id, date):
        """
        Returns the work session summary for a user starting or ending
        on the given date. Used for shifts that cross midnight.
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        id, usuario_id, turno_id,
                        hora_inicio_sesion, hora_fin_sesion,
                        total_minutos_trabajados, fecha_inicio_sesion
                    FROM resumen_sesion_trabajo
                    WHERE usuario_id = %s
                      AND (fecha_inicio_sesion = %s OR hora_fin_sesion::date = %s)
                    LIMIT 1
                """, (str(user_id), date, date))
                return cur.fetchone()

    def batch_upsert_multi_day_shift_summary(self, records):
        """
        Bulk-inserts or updates multiple multi-day shift summary records in one transaction.
        records: List of tuples (usuario_id, turno_id, hora_inicio_sesion, hora_fin_sesion,
                                 total_minutos_trabajados, fecha_inicio_sesion)
        """
        if not records:
            return

        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO resumen_sesion_trabajo (
                        id, usuario_id, turno_id, hora_inicio_sesion, hora_fin_sesion,
                        total_minutos_trabajados, fecha_inicio_sesion, created_at, updated_at
                    )
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    ON CONFLICT (usuario_id, hora_inicio_sesion) DO UPDATE SET
                        turno_id = EXCLUDED.turno_id,
                        hora_fin_sesion = EXCLUDED.hora_fin_sesion,
                        total_minutos_trabajados = EXCLUDED.total_minutos_trabajados,
                        fecha_inicio_sesion = EXCLUDED.fecha_inicio_sesion,
                        updated_at = NOW();
                """
                cur.executemany(sql, records)
            conn.commit()
