import { getVisibleAreas } from "./area-visibility.service";

/**
 * Obtiene las áreas visibles para el usuario y las organiza en una estructura de árbol.
 * 
 * @param {Object} currentUser - Usuario actual de la sesión.
 * @returns {Promise<Object[]>} Estructura jerárquica de áreas.
 */
export async function getAreaTree(currentUser) {
  try {
    console.log("[DEBUG getAreaTree] Buscando áreas para el usuario:", currentUser?.id);
    const areas = await getVisibleAreas(currentUser);
    console.log("[DEBUG getAreaTree] Áreas encontradas:", areas?.length);

    if (!areas || areas.length === 0) return [];

    // Mapeamos para facilitar el acceso por ID y preparar la estructura
    const areaMap = {};
    areas.forEach(area => {
      areaMap[area.id] = { ...area, children: [] };
    });

    const roots = [];

    areas.forEach(area => {
      const node = areaMap[area.id];
      const parentId = area.parent_id;

      // Si tiene padre y el padre está en el mapa (es visible para el usuario)
      if (parentId && areaMap[parentId]) {
        areaMap[parentId].children.push(node);
      } else {
        // Si no tiene padre o el padre no es visible, se considera una raíz para este usuario
        roots.push(node);
      }
    });

    // Ordenar raíces por nombre
    const result = roots.sort((a, b) => a.nombre.localeCompare(b.nombre));
    console.log("[DEBUG getAreaTree] Árbol construido con raíces:", result.length);
    return result;
  } catch (error) {
    console.error("Error al construir el árbol de áreas:", error);
    return [];
  }
}
