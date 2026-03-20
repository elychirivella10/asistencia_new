import prisma from "@/lib/prisma";

/**
 * Validates business rules for area hierarchy.
 * 
 * @param {string} tipo_id - ID of selected area type
 * @param {string|null} parent_id - Parent area ID
 * @param {string|null} current_id - ID of area being edited (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateAreaHierarchy(tipo_id, parent_id, current_id) {
  if (!tipo_id) return { success: true };

  // 1. Get level of selected type
  const tipoArea = await prisma.cat_tipos_area.findUnique({
    where: { id: parseInt(tipo_id) }
  });

  if (!tipoArea) {
    return { success: false, error: 'El tipo de área seleccionado no es válido.' };
  }

  // 2. If it has parent, validate parent has higher hierarchy (lower level)
  if (parent_id) {
    const parentArea = await prisma.areas.findUnique({
      where: { id: parent_id },
      include: { cat_tipos_area: true }
    });

    if (!parentArea) {
      return { success: false, error: 'El área padre seleccionada no existe.' };
    }

    if (!parentArea.cat_tipos_area) {
      return { success: false, error: 'El área padre no tiene un tipo asignado, por lo que no puede tener sub-áreas.' };
    }

    if (parentArea.cat_tipos_area.nivel_jerarquico >= tipoArea.nivel_jerarquico) {
      return { 
        success: false, 
        error: `Jerarquía inválida: Un ${tipoArea.nombre} (Nivel ${tipoArea.nivel_jerarquico}) no puede depender de un ${parentArea.cat_tipos_area.nombre} (Nivel ${parentArea.cat_tipos_area.nivel_jerarquico}).` 
      };
    }
  }

  // 3. If editing (has ID), validate it doesn't break hierarchy with existing children
  if (current_id) {
    const childAreas = await prisma.areas.findMany({
      where: { parent_id: current_id },
      include: { cat_tipos_area: true }
    });

    for (const child of childAreas) {
      if (child.cat_tipos_area) {
        if (tipoArea.nivel_jerarquico >= child.cat_tipos_area.nivel_jerarquico) {
          return {
            success: false,
            error: `No se puede cambiar el tipo: Esta área tiene una sub-área (${child.nombre} - ${child.cat_tipos_area.nombre}) que tendría mayor o igual jerarquía.`
          };
        }
      }
    }
  }

  return { success: true };
}

/**
 * Validates if an area can be deleted.
 * 
 * @param {string} id - Area ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateAreaDeletion(id) {
    // Validate if it has sub-areas
    const subAreas = await prisma.areas.count({
      where: { parent_id: id }
    });

    if (subAreas > 0) {
      return { success: false, error: 'No se puede eliminar: El área tiene sub-áreas asignadas.' };
    }

    // Validate if it has assigned users
    const users = await prisma.usuarios.count({
      where: { area_id: id }
    });

    if (users > 0) {
      return { success: false, error: 'No se puede eliminar: El área tiene usuarios asignados.' };
    }

    return { success: true };
}
