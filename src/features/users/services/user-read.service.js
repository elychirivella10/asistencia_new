import prisma from "@/lib/prisma";
import { getUserScope } from "./user-policy.service";
import { USER_CONFIG } from "../config/user.constants";

/**
 * Gets necessary data for users management page.
 * Includes users (with relations), areas, and shifts.
 * @param {Object} currentUser - Authenticated user for security scope.
 * @returns {Promise<{users: Array, areas: Array, turnos: Array, roles: Array}>}
 */
export async function getUsersPageData(
  currentUser,
  { page, pageSize, searchTerm, areaId, status, sortKey, sortDirection } = {}
) {
  if (!prisma) {
    // Should generally not happen if prisma is imported correctly
    return { users: [], areas: [], turnos: [], roles: [] };
  }

  try {
    // Apply security scope
    const securityFilter = await getUserScope(currentUser);

    const safePageSize = Number.isFinite(Number(pageSize)) ? Math.max(1, Math.min(100, Number(pageSize))) : 10;
    const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
    const safeSearchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";
    const safeAreaId = typeof areaId === "string" ? areaId : USER_CONFIG.STATUS.ALL;
    const safeStatus = typeof status === "string" ? status : USER_CONFIG.STATUS.ALL;

    const where = { ...securityFilter };

    if (safeSearchTerm) {
      where.OR = [
        { nombre: { contains: safeSearchTerm, mode: "insensitive" } },
        { apellido: { contains: safeSearchTerm, mode: "insensitive" } },
        { cedula: { contains: safeSearchTerm } },
      ];
    }

    if (safeAreaId && safeAreaId !== USER_CONFIG.STATUS.ALL) {
      where.area_id = safeAreaId;
    }

    if (safeStatus === USER_CONFIG.STATUS.ACTIVE) where.es_activo = true;
    if (safeStatus === USER_CONFIG.STATUS.INACTIVE) where.es_activo = false;

    const direction = sortDirection === "desc" ? "desc" : "asc";
    const allowed = new Set(["nombre", "area", "rol", "es_activo", "biometric_id"]);
    const orderBy = (() => {
      if (!sortKey || !allowed.has(sortKey)) return [{ created_at: "desc" }];
      if (sortKey === "nombre") {
        return [
          { nombre: direction },
          { apellido: direction },
          { created_at: "desc" },
        ];
      }
      if (sortKey === "area") return [{ areas_pertenece: { nombre: direction } }, { created_at: "desc" }];
      if (sortKey === "rol") return [{ roles: { nombre: direction } }, { created_at: "desc" }];
      return [{ [sortKey]: direction }, { created_at: "desc" }];
    })();

    const skip = (safePage - 1) * safePageSize;

    const [users, totalCount, turnos, roles] = await Promise.all([
      prisma.usuarios.findMany({
        where,
        orderBy,
        skip,
        take: safePageSize,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          cedula: true,
          email: true,
          area_id: true,
          rol_id: true,
          turno_id: true,
          es_activo: true,
          biometric_id: true,
          created_at: true,
          areas_pertenece: {
            select: {
              id: true,
              nombre: true,
              cat_tipos_area: { select: { nombre: true, nivel_jerarquico: true } },
            },
          },
          turnos: { select: { id: true, nombre: true } },
          roles: { select: { id: true, nombre: true } },
        },
      }),
      prisma.usuarios.count({ where }),
      prisma.turnos.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
      prisma.roles.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    const boundedPage = Math.min(safePage, totalPages);

    return {
      users,
      totalCount,
      page: boundedPage,
      pageSize: safePageSize,
      totalPages,
      areas: [],
      turnos,
      roles,
    };
  } catch (error) {
    console.error("Error loading users page data:", error);
    throw error;
  }
}

/**
 * Searches users by name, surname or ID card.
 * @param {string} query - Search term.
 * @param {Object} [currentUser] - Authenticated user for security scope.
 * @returns {Promise<Array>} List of users (id, nombre, apellido, cedula).
 */
export async function searchUsers(query, currentUser) {
  if (!query || query.length < 2) return [];

  try {
    const where = {
      AND: [
        { es_activo: true },
        {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' } },
            { apellido: { contains: query, mode: 'insensitive' } },
            { cedula: { contains: query } }
          ]
        }
      ]
    };

    if (currentUser) {
       const securityFilter = await getUserScope(currentUser);
       Object.assign(where, securityFilter);
    }

    const users = await prisma.usuarios.findMany({
      where,
      take: 10,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true
      }
    });
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
