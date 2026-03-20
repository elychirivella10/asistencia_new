import prisma from "@/lib/prisma";

/**
 * Obtiene el catálogo de tipos de permiso.
 * Se usa para poblar los selectores en formularios de novedades y permisos.
 */
export async function getIncidentTypes() {
  return await prisma.cat_tipos_permiso.findMany({
    orderBy: { nombre: 'asc' },
    select: {
      id: true,
      nombre: true,
      requiere_soporte: true,
      goce_sueldo: true,
      permite_parcial: true
    }
  });
}
