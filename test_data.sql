INSERT INTO roles (id, nombre, descripcion) VALUES (999, 'VIGILANTE', 'Rol para personal de seguridad') ON CONFLICT (id) DO NOTHING;

INSERT INTO turnos (id, nombre, hora_entrada, hora_salida, margen_tolerancia_min, dias_laborales, cruza_medianoche, created_at)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vigilancia 24h', '07:00:00', '07:00:00', 15, ARRAY[0,1,2,3,4,5,6], TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    hora_entrada = EXCLUDED.hora_entrada,
    hora_salida = EXCLUDED.hora_salida,
    margen_tolerancia_min = EXCLUDED.margen_tolerancia_min,
    dias_laborales = EXCLUDED.dias_laborales,
    cruza_medianoche = EXCLUDED.cruza_medianoche;
INSERT INTO usuarios (id, nombre, apellido, email, biometric_id, area_id, turno_id, es_activo, created_at, cedula, fecha_ingreso, rol_id, password)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Juan',
    'Perez',
    'juan.perez@example.com',
    '1001',
    NULL,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    TRUE,
    NOW(),
    '123456789',
    '2024-03-18',
    999,
    '$2b$12$EXAMPLEHASHFORPASSWORD' -- Reemplazar con un hash real si es necesario
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    email = EXCLUDED.email,
    biometric_id = EXCLUDED.biometric_id,
    turno_id = EXCLUDED.turno_id,
    es_activo = EXCLUDED.es_activo,
    cedula = EXCLUDED.cedula,
    rol_id = EXCLUDED.rol_id;

DELETE FROM marcajes_brutos WHERE usuario_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Marcajes brutos para simular un turno de 24 horas
-- Entrada el 18 de marzo a las 07:00:00
INSERT INTO marcajes_brutos (id, usuario_id, fecha_hora, tipo, origen, dispositivo_id, updated_at)
VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-18 07:00:00+00', 'ENTRADA', 'MANUAL', 'TESTDEV', NOW())
ON CONFLICT (id) DO NOTHING;

-- Salida el 19 de marzo a las 07:00:00
INSERT INTO marcajes_brutos (id, usuario_id, fecha_hora, tipo, origen, dispositivo_id, updated_at)
VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-19 07:00:00+00', 'SALIDA', 'MANUAL', 'TESTDEV', NOW())
ON CONFLICT (id) DO NOTHING;
