import prisma from "@/features/shared/lib/prisma";

/**
 * Obtiene el mapa de estados de asistencia y sus colores.
 * @returns {Promise<Object>} Objeto con slug como clave y color_hex como valor.
 */
export async function getAttendanceStatusMap() {
  try {
    const statuses = await prisma.$queryRaw`SELECT slug, nombre, color_hex, categoria, es_no_laborable, tipo_evento FROM cat_estados_asistencia`;
    
    if (!statuses || statuses.length === 0) {
      return {};
    }

    const sanitizeColor = (val) => {
      const v = typeof val === "string" ? val.trim() : "";
      const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      return hex.test(v) ? v : "#6b7280";
    };

    const map = statuses.reduce((acc, curr) => {
      const slug = curr.slug?.toLowerCase();
      if (slug) {
        acc[slug] = {
          label: curr.nombre,
          color: sanitizeColor(curr.color_hex),
          categoria: curr.categoria,
          es_no_laborable: curr.es_no_laborable,
          tipo_evento: curr.tipo_evento
        };
      }
      return acc;
    }, {});
    
    return map;
  } catch (error) {
    console.error("Error fetching attendance statuses:", error);
    return {};
  }
}
