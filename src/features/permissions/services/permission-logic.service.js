/**
 * Permisos Business Logic
 * Centraliza las reglas de cómo se estructuran y agrupan los permisos del sistema.
 */

/**
 * Agrupa una lista plana de permisos por su módulo (prefijo antes de los dos puntos ':').
 * @param {Array} permissions - Lista de permisos del sistema [{id, slug, descripcion}, ...]
 * @returns {Object} Permisos agrupados { 'ModuloName': [permisos...] }
 */
export const groupPermissionsByModule = (permissions = []) => {
  const groups = {};

  permissions.forEach(p => {
    // El slug suele ser 'modulo:accion'
    const label = p.slug || p.label || "";
    const [module] = label.includes(":") ? label.split(":") : ["Otros"];
    
    // Capitalizar nombre del módulo
    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    if (!groups[moduleName]) {
      groups[moduleName] = [];
    }

    groups[moduleName].push({
      id: p.id,
      label: label,
      description: p.descripcion || p.description || ""
    });
  });

  return groups;
};

/**
 * Filtra permisos basados en un término de búsqueda.
 * @param {Array} permissions - Lista plana de permisos.
 * @param {string} searchTerm - Término de búsqueda.
 * @returns {Array} Permisos que coinciden.
 */
export const filterPermissions = (permissions, searchTerm) => {
  if (!searchTerm) return permissions;
  
  const term = searchTerm.toLowerCase();
  return permissions.filter(p =>
    (p.slug || p.label || "").toLowerCase().includes(term) ||
    (p.descripcion || p.description || "").toLowerCase().includes(term)
  );
};
