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

  if (status && status !== ATTENDANCE_CONFIG.FILTERS.ALL) where.estado = { equals: status };
  if (llegada && llegada !== ATTENDANCE_CONFIG.FILTERS.ALL) where.llegada_slug = { equals: llegada };
  if (salida && salida !== ATTENDANCE_CONFIG.FILTERS.ALL) where.salida_slug = { equals: salida };
  if (excepcion && excepcion !== ATTENDANCE_CONFIG.FILTERS.ALL) where.estado_excepcion_slug = { equals: excepcion };

  const securityFilter = await getAttendanceScope(currentUser, areaId);
  Object.assign(where, securityFilter);

  const safeSearchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";
  if (safeSearchTerm) {
    where.usuarios = {
      ...where.usuarios,
      OR: [
        { nombre: { contains: safeSearchTerm, mode: "insensitive" } },
        { apellido: { contains: safeSearchTerm, mode: "insensitive" } },
        { cedula: { contains: safeSearchTerm, mode: "insensitive" } },
      ],
    };
  }

  return where;
}

