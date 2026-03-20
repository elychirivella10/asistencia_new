import prisma from "@/lib/prisma";
import { getIncidentScope } from "./incident-policy.service";

import { getIncidentTypes } from "./incident-types.service";

/**
 * Retrieves all data required for the Incidents Management Page.
 * @param {Object} currentUser - Current user session.
 * @returns {Promise<{incidents: Array, incidentTypes: Array}>}
 */
export const getIncidentsPageData = async (currentUser, { sortKey, sortDirection } = {}) => {
  try {
    const [incidents, incidentTypes] = await Promise.all([
      getIncidents(currentUser, { sortKey, sortDirection }),
      getIncidentTypes(),
    ]);

    return { incidents, incidentTypes };
  } catch (error) {
    console.error("Error loading incidents page data:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de novedades.
 * @param {Object} currentUser - Usuario autenticado.
 * @param {Object} [options] - Opciones adicionales.
 * @param {number} [options.limit=50] - Límite de registros.
 */
export async function getIncidents(currentUser, { limit = 50, sortKey, sortDirection } = {}) {
  const securityFilter = await getIncidentScope(currentUser);

  const items = await prisma.novedades.findMany({
    where: securityFilter,
    take: limit,
    orderBy: { fecha_inicio: 'desc' },
    include: {
      cat_tipos_permiso: true,
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          cedula: true,
          areas_pertenece: {
            select: {
              nombre: true
            }
          }
        }
      },
      validador: {
        select: {
          nombre: true,
          apellido: true,
        }
      }
    }
  });
  const allowed = new Set(["fecha_inicio","fecha_fin","usuario.nombre","cat_tipos_permiso.nombre","estado"]);
  if (sortKey && allowed.has(sortKey)) {
    const getNested = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
    items.sort((a, b) => {
      let av = sortKey.includes('.') ? getNested(a, sortKey) : a[sortKey];
      let bv = sortKey.includes('.') ? getNested(b, sortKey) : b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }
  return items;
}

/**
 * Obtiene una novedad por ID.
 */
export async function getIncidentById(id) {
  return await prisma.novedades.findUnique({
    where: { id: id },
    include: {
      cat_tipos_permiso: true,
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          cedula: true,
          areas_pertenece: {
            select: {
              nombre: true
            }
          }
        }
      },
      validador: {
        select: {
          nombre: true,
          apellido: true,
        }
      }
    }
  });
}
