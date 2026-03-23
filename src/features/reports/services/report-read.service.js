import prisma from "@/features/shared/lib/prisma";
import { formatTimeUTC } from "@/features/shared/lib/date-utils";
import { getGrossMinutes, getNetMinutes } from "@/features/shared/lib/attendance-utils";

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
}) {
  const fromDate = new Date(`${fechaDesde}T00:00:00.000Z`);
  const toDate = new Date(`${fechaHasta}T23:59:59.999Z`);

  const where = {
    fecha: { gte: fromDate, lte: toDate },
  };

  // Optional filters
  if (areaId && areaId !== 'all') {
    where.usuarios = { area_id: areaId };
  }
  if (status && status !== 'all') {
    where.estado = status;
  }
  if (llegada && llegada !== 'all') {
    where.llegada_slug = llegada;
  }
  if (salida && salida !== 'all') {
    where.salida_slug = salida;
  }
  if (excepcion && excepcion !== 'all') {
    where.estado_excepcion_slug = excepcion;
  }

  const rows = await prisma.resumen_diario.findMany({
    where,
    include: {
      usuarios: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          cedula: true,
          areas_pertenece: { select: { nombre: true } },
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
      const full = `${r.usuarios?.nombre ?? ''} ${r.usuarios?.apellido ?? ''} ${r.usuarios?.cedula ?? ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    })
    : rows;

  return filtered.map((r) => {
    // Determine specific permission name if an exception exists
    let permisoNombre = r.estado_excepcion_slug ?? null;

    if (permisoNombre) {
      // Find matching approved novedad for this user and date
      const match = overlappingNovedades.find(n =>
        n.usuario_id === r.usuarios?.id &&
        r.fecha >= n.fecha_inicio &&
        r.fecha <= n.fecha_fin
      );
      if (match?.cat_tipos_permiso?.nombre) {
        permisoNombre = match.cat_tipos_permiso.nombre;
      }
    }

    return {
      Empleado: `${r.usuarios?.nombre ?? ''} ${r.usuarios?.apellido ?? ''}`.trim(),
      Cedula: r.usuarios?.cedula ?? '—',
      Area: r.usuarios?.areas_pertenece?.nombre ?? 'Sin Área',
      Fecha: r.fecha.toISOString().split('T')[0],
      HoraEntrada: formatTimeUTC(r.hora_entrada),
      HoraSalida: formatTimeUTC(r.hora_salida),
      Permiso: permisoNombre,
      MinutosBruto: getGrossMinutes(r),
      MinutosNeto: getNetMinutes(r),
      MinutosExtras: r.extras_informativas_min ?? 0,
      MinutosTardanza: r.llegada_slug === 'llegada_tardia' ? Math.abs(r.minutos_debe ?? 0) : 0,
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
