import psycopg2
import uuid
import datetime
import bcrypt

class DBRepository:
    def __init__(self, db_url):
        self.db_url = db_url

    def get_existing_biometric_ids(self):
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id FROM usuarios WHERE biometric_id IS NOT NULL")
                return {row[0] for row in cur.fetchall()}

    def get_users_map_by_biometric_id(self):
        """Retorna un diccionario {biometric_id: usuario_id (uuid)}"""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT biometric_id, id FROM usuarios WHERE biometric_id IS NOT NULL")
                return {row[0]: row[1] for row in cur.fetchall()}

    def create_user(self, user_zk):
        """
        Crea un usuario nuevo si no existe.
        Verifica duplicados de cédula/biometric_id y genera password.
        """
        b_id = str(user_zk.user_id)
        name = user_zk.name or "Nuevo"
        cedula = b_id # Asumimos cedula = biometric_id por defecto
        email = f"user_{b_id}@empresa.com" # Placeholder
        
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                # 1. Verificar existencia (biometric_id O cedula)
                cur.execute("""
                    SELECT id FROM usuarios 
                    WHERE biometric_id = %s OR cedula = %s
                """, (b_id, cedula))
                
                if cur.fetchone():
                    # print(f"⚠️ Usuario omitido: {name} (ID/Cédula {b_id} ya existe)")
                    return # Simplemente ignoramos sin error

                # 2. Generar Password (hash de la cédula)
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

    def sync_attendance(self, attendances, device_id):
        """
        Inserta marcajes masivamente ignorando duplicados.
        Optimizado con Batch Insert y resolución previa de usuarios.
        """
        if not attendances:
            return 0

        tipos_map = {0: "ENTRADA", 1: "SALIDA", 2: "S.COMER", 3: "E.COMER"}
        user_map = self.get_users_map_by_biometric_id()
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
        """Inserta marcaje en tiempo real."""
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

    def get_late_arrival_info(self, cedula, timestamp):
        """
        Verifica si un marcaje es tardío y retorna la info necesaria para el correo.
        Retorna (email, nombre, hora_entrada_turno, es_tarde) o None
        """
        try:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    # Buscamos al usuario, su turno y tolerancia
                    cur.execute("""
                        SELECT 
                            u.id, u.email, u.nombre, 
                            t.hora_entrada, t.margen_tolerancia_min
                        FROM usuarios u
                        JOIN turnos t ON u.turno_id = t.id
                        WHERE u.cedula = %s AND u.es_activo = True
                    """, (str(cedula),))
                    
                    user_data = cur.fetchone()
                    if not user_data:
                        return None
                    
                    u_id, email, nombre, hora_entrada, tolerancia = user_data
                    
                    if not hora_entrada:
                        return None

                    # Extraer solo la hora del marcaje para comparar con la hora de entrada del turno
                    # Nota: timestamp viene como datetime object
                    hora_marcaje = timestamp.time()
                    
                    # Convertir hora_entrada (time) a datetime para sumarle la tolerancia
                    dt_base = datetime.datetime.combine(datetime.date.today(), hora_entrada)
                    entrada_con_tolerancia = (dt_base + datetime.timedelta(minutes=tolerancia or 0)).time()

                    if hora_marcaje > entrada_con_tolerancia:
                        return {
                            "usuario_id": u_id,
                            "email": email,
                            "nombre": nombre,
                            "hora_entrada": hora_entrada,
                            "es_tarde": True
                        }
                    
                    return None
        except Exception as e:
            print(f"🔥 Error al verificar tardanza: {e}")
            return None

    def log_notification(self, usuario_id, tipo, destinatario, exito):
        """Registra el envío de una notificación en la DB."""
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

    def sync_comedor_attendance(self, attendances, device_id):
        if not attendances:
            return 0
        self.ensure_comedor_table()
        user_map = self.get_users_map_by_biometric_id()
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
    # --- MÉTODOS PARA EL RESUMEN (SUMMARIZER) ---

    def get_unprocessed_dates(self):
        """
        Identifica fechas que necesitan ser procesadas.
        Incluye: Marcajes nuevos, día actual e invalidaciones manuales (NULL).
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    -- 1. Fechas con marcajes nuevos o actividad hoy
                    SELECT DISTINCT mb.fecha_hora::date 
                    FROM marcajes_brutos mb
                    LEFT JOIN resumen_diario rd ON mb.fecha_hora::date = rd.fecha
                    WHERE rd.id IS NULL 
                       OR mb.updated_at > rd.last_processed_at
                       OR mb.fecha_hora::date = CURRENT_DATE
                    
                    UNION
                    
                    -- 2. Fechas invalidadas manualmente desde la Web (last_processed_at IS NULL)
                    SELECT DISTINCT fecha 
                    FROM resumen_diario 
                    WHERE last_processed_at IS NULL
                    
                    ORDER BY 1 ASC;
                """)
                return [row[0] for row in cur.fetchall()]

    def get_users_with_shifts(self):
        """Obtiene usuarios activos con info de turno."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, u.nombre, t.hora_entrada, t.hora_salida, t.margen_tolerancia_min, t.dias_laborales, t.id
                    FROM usuarios u
                    LEFT JOIN turnos t ON u.turno_id = t.id
                    WHERE u.es_activo = True
                """)
                return cur.fetchall()

    def get_daily_punches_stats(self, user_id, date):
        """Retorna MIN, MAX y COUNT de marcajes para un usuario en una fecha."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT MIN(fecha_hora), MAX(fecha_hora), COUNT(*)
                    FROM marcajes_brutos 
                    WHERE usuario_id = %s AND fecha_hora::date = %s
                      AND tipo IN ('ENTRADA','SALIDA')
                """, (user_id, date))
                return cur.fetchone()

    def get_user_by_cedula(self, cedula):
        """Obtiene un usuario por su número de cédula."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, nombre, apellido FROM usuarios WHERE cedula = %s", (cedula,))
                return cur.fetchone()

    def get_daily_summary_for_user_and_date(self, user_id, date):
        """Obtiene el resumen diario para un usuario en una fecha específica."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        fecha,
                        hora_entrada,
                        hora_salida,
                        minutos_trabajados,
                        extras_informativas_min,
                        minutos_esperados,
                        minutos_debe,
                        saldo_minutos,
                        permiso_parcial_min,
                        minutos_trabajados_neto,
                        comedor_descuento_min,
                        estado,
                        notificado_tardia,
                        observaciones,
                        llegada_slug,
                        salida_slug,
                        es_incompleto,
                        estado_excepcion_slug
                    FROM resumen_diario
                    WHERE usuario_id = %s AND fecha = %s
                """, (str(user_id), date))
                return cur.fetchone()

    def get_holiday_or_novelty(self, user_id, date):
        """Busca si hay feriado o novedad (permiso/vacación) para el día."""
        feriado = None
        novedad = None
        
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                # Buscar Feriado
                cur.execute("SELECT descripcion FROM feriados WHERE fecha = %s", (date,))
                res_f = cur.fetchone()
                if res_f: feriado = res_f[0]

                # Buscar Novedad
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

    def get_all_punches_for_date(self, date):
        """
        Retorna estadísticas de marcajes para TODOS los usuarios en una fecha específica.
        Optimizado para evitar N+1 queries.
        Retorna: Diccionario {user_id: (min_fecha, max_fecha, count)}
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

    def get_all_novelties_for_date(self, date):
        """
        Retorna todas las novedades activas para una fecha.
        Retorna: Diccionario {user_id: {tipo, es_dia_completo, hora_inicio, hora_fin}}
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

    def get_novelty_types_map(self):
        """
        Retorna un mapa de {nombre: slug} para normalizar estados.
        Esto permite que el script sea 100% dinámico.
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT tp.nombre, mpe.estado_slug
                    FROM cat_tipos_permiso tp
                    JOIN cat_tipos_permiso_estado mpe ON mpe.tipo_id = tp.id
                """)
                return {row[0].lower(): row[1].lower() for row in cur.fetchall()}

    def get_holiday_for_date(self, date):
        """Retorna la descripción del feriado si existe para la fecha."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT descripcion FROM feriados WHERE fecha = %s", (date,))
                res = cur.fetchone()
                return res[0] if res else None

    def get_users_with_active_multi_day_shifts(self):
        """Obtiene usuarios con turnos que cruzan la medianoche."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, t.hora_entrada, t.hora_salida
                    FROM usuarios u
                    JOIN turnos t ON u.turno_id = t.id
                    WHERE u.es_activo = True AND t.cruza_medianoche = TRUE
                """)
                return cur.fetchall()

    def get_punches_for_user_on_date(self, user_id, target_date):
        """Obtiene los marcajes de un usuario en una fecha específica."""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT fecha_hora, tipo
                    FROM marcajes_brutos
                    WHERE usuario_id = %s AND fecha_hora::date = %s
                    ORDER BY fecha_hora ASC
                """, (user_id, target_date))
                return cur.fetchall()

    def update_daily_summary_for_multi_day(self, user_id, target_date, minutes_worked, minutes_expected, entry_time, exit_time):
        """Actualiza un registro de resumen_diario con datos de sesión multi-día."""
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


    def batch_upsert_multi_day_shift_summary(self, records):
        """
        Inserta o actualiza múltiples registros de resumen de turno multi-día en una sola transacción.
        records: Lista de tuplas (usuario_id, turno_id, hora_inicio_sesion, hora_fin_sesion, total_minutos_trabajados, fecha_inicio_sesion)
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

    def batch_upsert_daily_summary(self, records):
        """
        Inserta o actualiza múltiples registros de resumen diario en una sola transacción.
        records: Lista de tuplas (user_id, date, entrada, salida, minutos, extras, esperados, debe, saldo, permiso_parcial, minutos_neto, descuento, estado, tardia, obs, llegada, salida_s, incompleto, excepcion)
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
                # psycopg2.extras.execute_batch es más eficiente, pero executemany es estándar y mejor que loop
                cur.executemany(sql, records)
            conn.commit()

    def get_shift_details_for_user_on_date(self, user_id, date):
        """
        Obtiene los detalles del turno para un usuario en una fecha específica,
        incluyendo si el turno cruza la medianoche.
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

    def get_multi_day_shift_summary_for_date(self, user_id, date):
        """
        Obtiene el resumen de sesión de trabajo para un usuario que inicia o finaliza
        en la fecha dada. Esto es para turnos que cruzan la medianoche.
        """
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        id,
                        usuario_id,
                        turno_id,
                        hora_inicio_sesion,
                        hora_fin_sesion,
                        total_minutos_trabajados,
                        fecha_inicio_sesion
                    FROM resumen_sesion_trabajo
                    WHERE usuario_id = %s
                      AND (fecha_inicio_sesion = %s OR hora_fin_sesion::date = %s)
                    LIMIT 1
                """, (str(user_id), date, date))
                return cur.fetchone()
