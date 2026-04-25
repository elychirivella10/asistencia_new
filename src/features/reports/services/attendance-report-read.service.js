import prisma from "@/features/shared/lib/prisma";
import { formatTimeUTC } from "@/features/shared/lib/date-utils";
import { getGrossMinutes, getNetMinutes } from "@/features/attendance/lib/attendance-utils";
import { getReportScope } from "./report-policy.service";
import { buildReportOrderBy } from "./report-orderby.service";

/**
 * Fetches the flat attendance data for a date range with optional filters.
 *
 * @param {Object} filters
 * @param {string} filters.fechaDesde  - 'YYYY-MM-DD'
 * @param {string} filters.fechaHasta  - 'YYYY-MM-DD'
 * @param {string} [filters.areaId]
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.status]
 * @param {string} [filters.llegada]
 * @param {string} [filters.salida]
 * @param {string} [filters.excepcion]
 */
export async function getAttendanceReport({
  fechaDesde,
  fechaHasta,
  areaId,
  searchTerm,
  status,
  llegada,
  salida,
  excepcion,
  page,
  pageSize,
  sortKey,
  sortDirection
}, session) {
  // Dates are already Date objects from Zod coercion
  const fromDate = fechaDesde;
  const toDate = new Date(fechaHasta.setHours(23, 59, 59, 999));

  const where = {
    fecha: { gte: fromDate, lte: toDate },
  };

  // Enforce area scope — delegated to report-policy.service (mirrors attendance pattern)
  const scopeFilter = await getReportScope(session, areaId);
  Object.assign(where, scopeFilter);

  const andConditions = [];
  const toArray = (val) => Array.isArray(val) ? val : [val];
  const buildInsensitiveOr = (field, values) => {
    return toArray(values).map(v => ({ [field]: { equals: v, mode: 'insensitive' } }));
  };

  if (status && status.length > 0 && status !== 'all') {
    andConditions.push({ OR: buildInsensitiveOr('estado', status) });
  }
  if (llegada && llegada.length > 0 && llegada !== 'all') {
    andConditions.push({ OR: buildInsensitiveOr('llegada_slug', llegada) });
  }
  if (salida && salida.length > 0 && salida !== 'all') {
    andConditions.push({ OR: buildInsensitiveOr('salida_slug', salida) });
  }
  if (excepcion && excepcion.length > 0 && excepcion !== 'all') {
    andConditions.push({ OR: buildInsensitiveOr('estado_excepcion_slug', excepcion) });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Search term filter (DB side for performance and correct pagination)
  if (searchTerm) {
    where.usuario = {
      ...where.usuario,
      OR: [
        { nombre: { contains: searchTerm, mode: "insensitive" } },
        { apellido: { contains: searchTerm, mode: "insensitive" } },
        { cedula: { contains: searchTerm, mode: "insensitive" } },
      ],
    };
  }

  // Handle pagination params
  const skip = page && pageSize ? (Math.max(1, page) - 1) * pageSize : undefined;
  const take = page && pageSize ? pageSize : undefined;
  
  // Handle sorting dynamic
  const orderBy = buildReportOrderBy(sortKey, sortDirection, "fecha");

  const [totalCount, rows] = await Promise.all([
    prisma.resumen_diario.count({ where }),
    prisma.resumen_diario.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cedula: true,
            area: { select: { nombre: true } },
          },
        },
      },
    }),
  ]);

  // Fetch approved novedades overlapping the date range
  const overlappingNovedades = await prisma.novedades.findMany({
    where: {
      estado: 'APROBADO',
      fecha_inicio: { lte: toDate },
      fecha_fin: { gte: fromDate }
    },
    include: {
      cat_tipos_permiso: { select: { nombre: true } }
    }
  });

  const formattedData = rows.map((r) => {
    // Determine specific permission name if an exception exists
    let permisoNombre = r.estado_excepcion_slug ?? null;

    if (permisoNombre) {
      // Find matching approved novedad for this user and date
      const match = overlappingNovedades.find(n =>
        n.usuario_id === r.usuario?.id &&
        r.fecha >= n.fecha_inicio &&
        r.fecha <= n.fecha_fin
      );
      if (match?.cat_tipos_permiso?.nombre) {
        permisoNombre = match.cat_tipos_permiso.nombre;
      }
    }

    return {
      Empleado: `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''}`.trim(),
      Cedula: r.usuario?.cedula ?? '—',
      Area: r.usuario?.area?.nombre ?? 'Sin Área',
      Fecha: r.fecha.toISOString().split('T')[0],
      HoraEntrada: formatTimeUTC(r.hora_entrada),
      HoraSalida: formatTimeUTC(r.hora_salida),
      Permiso: permisoNombre,
      MinutosBruto: getGrossMinutes(r),
      MinutosNeto: getNetMinutes(r),
      MinutosExtras: r.extras_informativas_min ?? 0,
      MinutosDebe: Math.abs(r.minutos_debe ?? 0),
      NotificadoTardia: r.notificado_tardia ?? false,
      Estado: r.estado ?? 'DESCONOCIDO',
    };
  });

  return { data: formattedData, totalCount };
}

/**
 * Fetches areas and statusMap needed for the report toolbar.
 * Reuses the same services as the attendance module.
 */
export async function getReportPageData(session) {
  const { getVisibleAreas } = await import('@/features/areas/services/area-visibility.service');
  const { getAttendanceStatusMap } = await import('@/features/attendance/services/attendance-status.service');

  const [areas, statusMap] = await Promise.all([
    getVisibleAreas(session),
    getAttendanceStatusMap(),
  ]);

  return { areas, statusMap };
}
