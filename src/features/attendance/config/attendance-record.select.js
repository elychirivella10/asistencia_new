export const ATTENDANCE_RECORD_SELECT = {
  id: true,
  fecha: true,
  hora_entrada: true,
  hora_salida: true,
  notificado_tardia: true,
  estado: true,
  llegada_slug: true,
  salida_slug: true,
  extras_informativas_min: true,
  minutos_esperados: true,
  minutos_debe: true,
  saldo_minutos: true,
  permiso_parcial_min: true,
  minutos_trabajados: true,
  minutos_trabajados_neto: true,
  comedor_descuento_min: true,
  usuarios: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      cedula: true,
      areas_pertenece: { select: { nombre: true } },
    },
  },
};

