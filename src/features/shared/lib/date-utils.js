import { format, addMinutes } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Convierte un string de hora en formato "HH:mm" a un objeto Date.
 * @param {string} timeStr - Hora en formato "HH:mm"
 * @returns {Date|null} Objeto Date con la hora establecida o null si no es válido.
 */
export const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return d;
};

export const formatHM = (mins) => {
  const m = Number(mins) || 0;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

/**
 * Formatea una fecha ISO/UTC para mostrarla en la UI sin verse afectada por la zona horaria local.
 * Útil para fechas puras (solo día/mes/año) que vienen del backend.
 * @param {string|Date} dateInput - Fecha a formatear
 * @param {string} formatStr - Formato date-fns (default: 'dd/MM/yyyy')
 * @returns {string} Fecha formateada
 */
export const formatDateUTC = (dateInput, formatStr = 'dd/MM/yyyy') => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    // Compensamos el offset para que al visualizarse no reste horas
    const utcDate = addMinutes(date, date.getTimezoneOffset());
    return format(utcDate, formatStr, { locale: es });
};

/**
 * Formatea una fecha/hora para mostrar SOLO la hora (HH:mm) ignorando la zona horaria local.
 * Extrae las horas y minutos UTC del objeto Date.
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {string} Hora en formato HH:mm o "--:--"
 */
export const formatTimeUTC = (dateInput) => {
    if (!dateInput) return "--:--";
    const date = new Date(dateInput);
    
    // Usamos getUTCHours/Minutes porque las fechas vienen del backend como UTC (o timestamps absolutos)
    // y queremos mostrarlas tal cual fueron guardadas, sin la conversión automática del navegador.
    // Si la fecha original era "2023-01-01T08:00:00.000Z", queremos ver "08:00", no "03:00".
    
    // Ajuste: Dependiendo de cómo Prisma devuelva las fechas (si es string ISO o Date object).
    // Si es Date object, JS lo trata en local time por defecto al hacer getHours().
    // Pero si usamos los métodos UTC, obtenemos el valor crudo.
    
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
};
