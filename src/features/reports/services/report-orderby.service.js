/**
 * Builds the Prisma orderBy array for reports, following the pattern from attendance.
 *
 * @param {string} sortKey - The field or path to sort by.
 * @param {string} sortDirection - 'asc' or 'desc'.
 * @param {string} defaultKey - The default sort field if none provided.
 * @returns {Array} Prisma orderBy array.
 */
export function buildReportOrderBy(sortKey, sortDirection, defaultKey = "fecha") {
  const direction = sortDirection === "desc" ? "desc" : "asc";

  // Map of frontend sort keys to Prisma ordering objects
  // This supports dot notation for relations if needed
  const allowedMappings = {
    // Common fields
    "fecha": { fecha: direction },
    "fecha_inicio": { fecha_inicio: direction },
    "fecha_fin": { fecha_fin: direction },
    "estado": { estado: direction },
    
    // Relation fields
    "Empleado": { usuario: { nombre: direction } },
    "usuario.nombre": { usuario: { nombre: direction } },
    "Area": { usuario: { area: { nombre: direction } } },
    "usuario.area.nombre": { usuario: { area: { nombre: direction } } },
    
    // Attendance specific
    "Llegada": { llegada_slug: direction },
    "Salida": { salida_slug: direction },
    "Excepcion": { estado_excepcion_slug: direction },
    
    // Novedades specific
    "TipoPermiso": { cat_tipos_permiso: { nombre: direction } },
    "Aprobador": { validador: { nombre: direction } },
  };

  const primarySort = allowedMappings[sortKey];

  if (!primarySort) {
    return [{ [defaultKey]: direction }];
  }

  // Combine primary sort with defensive default sort for stable pagination
  return [primarySort, { [defaultKey]: direction }];
}
