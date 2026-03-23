/**
 * Extrae los minutos brutos trabajados de un registro de asistencia o resumen diario.
 * @param {Object} record - Registro de base de datos
 * @returns {number} Minutos
 */
export const getGrossMinutes = (record) => {
  return record?.minutos_trabajados ?? 0;
};

/**
 * Extrae los minutos netos trabajados (tiempo bruto menos descuentos como el comedor).
 * Usa el campo calculado por DB si existe, o hace un fallback al tiempo bruto.
 * @param {Object} record - Registro de base de datos
 * @returns {number} Minutos
 */
export const getNetMinutes = (record) => {
  return record?.minutos_trabajados_neto ?? record?.minutos_trabajados ?? 0;
};
