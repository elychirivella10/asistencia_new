import prisma from "@/lib/prisma";

/**
 * Retrieves all data required for the Roles Management Page.
 * @returns {Promise<{roles: Array, permissions: Array}>}
 */
export const getRolesPageData = async ({ sortKey, sortDirection } = {}) => {
  try {
    let [roles, permissions] = await Promise.all([
      getRoles(),
      getAllSystemPermissions(),
    ]);

    const allowed = new Set(["nombre","usuario_count"]);
    if (sortKey && allowed.has(sortKey)) {
      roles.sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDirection === "asc" ? -1 : 1;
        if (av > bv) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return { roles, permissions };
  } catch (error) {
    console.error("Error loading roles page data:", error);
    throw error;
  }
};

/**
 * Retrieves all roles with their user counts and system permissions.
 * @returns {Promise<Array>} List of roles with formatted permissions.
 */
export const getRoles = async () => {
  const roles = await prisma.roles.findMany({
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      created_at: true,
      _count: {
        select: { usuarios: true },
      },
      roles_permisos: {
        select: {
          permiso_id: true,
          permisos_sistema: {
            select: {
              id: true,
              slug: true,
              descripcion: true,
            },
          },
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return roles.map((rol) => ({
    ...rol,
    usuario_count: rol._count.usuarios,
    permisos: rol.roles_permisos.map((rp) => rp.permisos_sistema),
    permiso_ids: rol.roles_permisos.map((rp) => rp.permiso_id),
  }));
};

/**
 * Retrieves a specific role by ID with its permissions.
 * @param {string|number} id - The role ID.
 * @returns {Promise<Object|null>} The role object or null if not found.
 */
export const getRoleById = async (id) => {
  const role = await prisma.roles.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      roles_permisos: {
        select: {
          permiso_id: true,
          permisos_sistema: {
            select: {
              id: true,
              slug: true,
              descripcion: true,
            },
          },
        },
      },
    },
  });

  if (!role) return null;

  return {
    ...role,
    permisos: role.roles_permisos.map((rp) => rp.permisos_sistema),
    permiso_ids: role.roles_permisos.map((rp) => rp.permiso_id),
  };
};

/**
 * Retrieves all available system permissions.
 * @returns {Promise<Array>} List of system permissions.
 */
export const getAllSystemPermissions = async () => {
  return await prisma.permisos_sistema.findMany({
    orderBy: {
      slug: "asc",
    },
    select: {
      id: true,
      slug: true,
      descripcion: true,
    },
  });
};
