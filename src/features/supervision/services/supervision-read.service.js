import prisma from "@/features/shared/lib/prisma";
import { getSupervisionScope } from "./supervision-policy.service";
import { SUPERVISION_CONFIG } from "../config/supervision.constants";

/**
 * Retrieves all data required for the Supervision Page.
 * @param {Object} currentUser - The current user session.
 * @returns {Promise<{supervisions: Array}>}
 */
export const getSupervisionPageData = async (currentUser, { sortKey, sortDirection } = {}) => {
  try {
    let supervisions = await getSupervisions(currentUser);
    const allowed = new Set(["usuario_nombre","usuario_email","area_nombre","area_tipo"]);
    if (sortKey && allowed.has(sortKey)) {
      supervisions.sort((a, b) => {
        let av = a[sortKey] || "";
        let bv = b[sortKey] || "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDirection === "asc" ? -1 : 1;
        if (av > bv) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return { supervisions };
  } catch (error) {
    console.error("Error loading supervision page data:", error);
    throw error;
  }
};

/**
 * Gets all supervision permissions.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<Array>} List of permissions.
 */
export const getSupervisions = async (currentUser) => {
  const scope = await getSupervisionScope(currentUser);

  if (scope.id === 'DENIED') return [];

  const supervisions = await prisma.permiso_supervision.findMany({
    where: scope,
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          cedula: true
        }
      },
      area: {
        select: {
          id: true,
          nombre: true,
          cat_tipos_area: {
            select: { nombre: true }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  // Normalization / DTO
  return supervisions.map(item => ({
    ...item,
    usuario_nombre: `${item.usuario?.nombre} ${item.usuario?.apellido}`,
    usuario_email: item.usuario?.email,
    usuario_cedula: item.usuario?.cedula,
    area_nombre: item.area?.nombre,
    area_tipo: item.area?.cat_tipos_area?.nombre || SUPERVISION_CONFIG.UI.LABELS.NO_TYPE
  }));
};

export const getSupervisionById = async (id) => {
  return await prisma.permiso_supervision.findUnique({
    where: { id },
    include: {
        usuario: true,
        area: true
    }
  });
};
