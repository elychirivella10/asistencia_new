import { isSameDay, buildDateWhereSingle, buildDateWhereRange } from "@/features/shared/lib/date-range-utils";
import { getAttendanceScope } from "./attendance-policy.service";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

export async function buildAttendanceWhere({
  fromDate,
  toDate,
  areaId,
  searchTerm,
  status,
  llegada,
  salida,
  excepcion,
  currentUser,
}) {
  const where = {
    fecha: isSameDay(fromDate, toDate) ? buildDateWhereSingle(fromDate) : buildDateWhereRange(fromDate, toDate),
  };

  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.includes(',')) return val.split(',').map(s => s.trim()).filter(Boolean);
    return [val];
  };
  const buildInsensitiveOr = (field, values) => {
    return toArray(values).map(v => ({ [field]: { equals: v, mode: 'insensitive' } }));
  };
  
  const andConditions = [];

  const statusArr = toArray(status);
  const llegadaArr = toArray(llegada);
  const salidaArr = toArray(salida);
  const excepcionArr = toArray(excepcion);

  if (statusArr.length > 0 && !statusArr.includes(ATTENDANCE_CONFIG.FILTERS.ALL)) andConditions.push({ OR: buildInsensitiveOr('estado', statusArr) });
  if (llegadaArr.length > 0 && !llegadaArr.includes(ATTENDANCE_CONFIG.FILTERS.ALL)) andConditions.push({ OR: buildInsensitiveOr('llegada_slug', llegadaArr) });
  if (salidaArr.length > 0 && !salidaArr.includes(ATTENDANCE_CONFIG.FILTERS.ALL)) andConditions.push({ OR: buildInsensitiveOr('salida_slug', salidaArr) });
  if (excepcionArr.length > 0 && !excepcionArr.includes(ATTENDANCE_CONFIG.FILTERS.ALL)) andConditions.push({ OR: buildInsensitiveOr('estado_excepcion_slug', excepcionArr) });

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const securityFilter = await getAttendanceScope(currentUser, areaId);
  Object.assign(where, securityFilter);

  const safeSearchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";
  if (safeSearchTerm) {
    const words = safeSearchTerm.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      where.AND = [
        ...(where.AND || []),
        ...words.map(word => ({
          usuarios: {
            OR: [
              { nombre: { contains: word, mode: "insensitive" } },
              { apellido: { contains: word, mode: "insensitive" } },
              { cedula: { contains: word, mode: "insensitive" } },
            ]
          }
        }))
      ];
    } else {
      where.usuarios = {
        ...where.usuarios,
        OR: [
          { nombre: { contains: safeSearchTerm, mode: "insensitive" } },
          { apellido: { contains: safeSearchTerm, mode: "insensitive" } },
          { cedula: { contains: safeSearchTerm, mode: "insensitive" } },
        ],
      };
    }
  }

  return where;
}

