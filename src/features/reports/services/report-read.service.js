import prisma from "@/features/shared/lib/prisma";
import { formatTimeUTC } from "@/features/shared/lib/date-utils";
import { getGrossMinutes, getNetMinutes } from "@/features/attendance/lib/attendance-utils";
import { createScopeFilter, validateAreaAccess } from "@/features/permissions/services/scoping.service";
import { REPORT_CONFIG } from "../config/report.constants";

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
}, session) {
  const fromDate = new Date(`${fechaDesde}T00:00:00.000Z`);
  const toDate = new Date(`${fechaHasta}T23:59:59.999Z`);

  const where = {
    fecha: { gte: fromDate, lte: toDate },
  };

  // Enforce area scope — mirrors attendance module logic exactly
  let scopeFilter;
  if (areaId && areaId.length > 0 && areaId !== 'all') {
    // User requested a specific area — validate they have access to it
    const access = await validateAreaAccess({
      currentUser: session,
      areaId: Array.isArray(areaId) ? areaId[0] : areaId,
      globalPermission: REPORT_CONFIG.PERMISSIONS.READ_ALL,
    });
    if (!access.success) throw new Error("Access Denied: No tienes permiso para ver esta área.");
    scopeFilter = { usuario: { area_id: { in: Array.isArray(areaId) ? areaId : [areaId] } } };
  } else {
    // General view — scoped by role/hierarchy
    scopeFilter = await createScopeFilter({
      currentUser: session,
      readAllPermission: REPORT_CONFIG.PERMISSIONS.READ_ALL,
      fieldMap: { areaField: 'usuario.area_id', userField: 'usuario_id' },
      allowSelf: true,
    });
  }
  Object.assign(where, scopeFilter);

  const andConditions = [];

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

  const rows = await prisma.resumen_diario.findMany({
    where,
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
    orderBy: [{ fecha: 'asc' }],
  });

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

  // Apply search term filter (client-side on the result set — avoids complex DB query)
  const filtered = searchTerm
    ? rows.filter((r) => {
      const full = `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''} ${r.usuario?.cedula ?? ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    })
    : rows;

  return filtered.map((r) => {
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
