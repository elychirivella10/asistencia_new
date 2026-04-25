INSERT INTO cat_dedos (id, nombre, mano) VALUES
(0, 'Meñique', 'Izquierda'),
(1, 'Anular', 'Izquierda'),
(2, 'Medio', 'Izquierda'),
(3, 'Índice', 'Izquierda'),
(4, 'Pulgar', 'Izquierda'),
(5, 'Pulgar', 'Derecha'),
(6, 'Índice', 'Derecha'),
(7, 'Medio', 'Derecha'),
(8, 'Anular', 'Derecha'),
(9, 'Meñique', 'Derecha')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, mano = EXCLUDED.mano;
