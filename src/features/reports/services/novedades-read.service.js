import prisma from "@/features/shared/lib/prisma";
import { formatTimeUTC, formatDateUTC } from "@/features/shared/lib/date-utils";

/**
 * Fetches required metadata for exactly the Novedades tab.
 */
export async function getNovedadesPageData() {
  try {
    const tiposPermiso = await prisma.cat_tipos_permiso.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    });
    return { success: true, tiposPermiso };
  } catch (error) {
    console.error("Error fetching tipos_permiso:", error);
    return { success: false, error: "Failed to load Tipos de Permiso" };
  }
}

/**
 * Fetches the Novedades (Absences/Permissions) data for a date range with optional filters.
 *
 * @param {Object} filters
 * @param {string} filters.fechaDesde  - 'YYYY-MM-DD'
 * @param {string} filters.fechaHasta  - 'YYYY-MM-DD'
 * @param {string} [filters.areaId]
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.status] - 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'all'
 * @param {number|string} [filters.tipoPermisoId]
 */
export async function getNovedadesReport({
  fechaDesde,
  fechaHasta,
  areaId,
  searchTerm,
  status,
  tipoPermisoId,
}) {
  const fromDate = new Date(`${fechaDesde}T00:00:00.000Z`);
  const toDate = new Date(`${fechaHasta}T23:59:59.999Z`);

  const where = {
    // Only fetch records where the absence window intersects the requested report window
    fecha_inicio: { lte: toDate },
    fecha_fin: { gte: fromDate }
  };

  // Optional filters
  if (areaId && areaId !== 'all') {
    where.usuario = { area_id: areaId };
  }
  if (status && status !== 'all') {
    where.estado = status.toUpperCase();
  }
  if (tipoPermisoId && tipoPermisoId !== 'all') {
    where.tipo_id = parseInt(tipoPermisoId, 10);
  }

  const rows = await prisma.novedades.findMany({
    where,
    include: {
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          cedula: true,
          areas_pertenece: { select: { nombre: true } },
        },
      },
      validador: {
        select: {
          nombre: true,
          apellido: true,
        }
      },
      cat_tipos_permiso: {
        select: { nombre: true }
      }
    },
    orderBy: { fecha_inicio: 'desc' },
  });

  // Apply search term filter (client-side on the result set)
  const filtered = searchTerm
    ? rows.filter((r) => {
      const str = `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''} ${r.usuario?.cedula ?? ''}`.toLowerCase();
      return str.includes(searchTerm.toLowerCase());
    })
    : rows;

  return filtered.map((r) => {
    let duracion = r.es_dia_completo ? "Día Completo" : "Parcial";
    if (!r.es_dia_completo && r.hora_inicio && r.hora_fin) {
      duracion = `${formatTimeUTC(r.hora_inicio)} - ${formatTimeUTC(r.hora_fin)}`;
    }

    return {
      Empleado: `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''}`.trim(),
      Cedula: r.usuario?.cedula ?? '—',
      Area: r.usuario?.areas_pertenece?.nombre ?? 'Sin Área',
      Desde: r.fecha_inicio.toISOString().split('T')[0],
      Hasta: r.fecha_fin.toISOString().split('T')[0],
      TipoPermiso: r.cat_tipos_permiso?.nombre ?? 'Desconocido',
      Duracion: duracion,
      Estado: r.estado ?? 'PENDIENTE',
      Aprobador: r.validador ? `${r.validador.nombre} ${r.validador.apellido}`.trim() : '—',
      Observaciones: r.observaciones ?? '',
    };
  });
}
