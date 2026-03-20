import prisma from "@/lib/prisma";

/**
 * Obtiene todos los IDs de áreas que un usuario tiene permitido ver/gestionar.
 * Combina:
 * 1. Áreas donde es jefe directo.
 * 2. Sub-áreas de las anteriores (jerarquía recursiva usando CTE).
 * 3. Áreas asignadas explícitamente mediante PermisoSupervision.
 * 
 * @param {string} usuarioId - ID del usuario.
 * @returns {Promise<string[]>} Array de IDs de áreas permitidas.
 */
export async function getAreasPermitidas(usuarioId) {
  if (!usuarioId) return [];

  try {
    // Unificamos la lógica:
    // Tanto si eres Jefe Directo como si tienes un Permiso de Supervisión Manual sobre un área,
    // esa área se convierte en una "Raíz" desde la cual debes ver toda la descendencia (recursividad).
    
    const hierarchyResult = await prisma.$queryRaw`
      WITH RECURSIVE area_tree AS (
        -- 1. Anchor Member: Áreas Raíz (Donde soy Jefe O tengo Permiso Explícito)
        SELECT id
        FROM areas
        WHERE jefe_id = ${usuarioId}::uuid
        
        UNION
        
        SELECT area_id AS id
        FROM permiso_supervision
        WHERE usuario_id = ${usuarioId}::uuid
        
        UNION ALL
        
        -- 2. Recursive Member: Hijos de las anteriores
        SELECT a.id
        FROM areas a
        INNER JOIN area_tree at ON a.parent_id = at.id
      )
      SELECT DISTINCT id FROM area_tree;
    `;

    // Mapear resultado plano
    return hierarchyResult.map(r => r.id);

  } catch (error) {
    console.error("Error en getAreasPermitidas:", error);
    return [];
  }
}
