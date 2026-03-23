import prisma from "@/features/shared/lib/prisma";
import { getVisibleAreas } from "./area-visibility.service";
import { getAreaTypes } from "./area-types.service";

export const getAreasPageData = async (currentUser, { sortKey, sortDirection } = {}) => {
  try {
    const [areas, tiposArea] = await Promise.all([
      getVisibleAreas(currentUser),
      getAreaTypes()
    ]);
    const mappedAreas = areas.map(area => ({
      ...area,
      parent: area.areas,
      jefe: area.usuarios_areas_jefe_idTousuarios
    }));
    
    const allowed = new Set(["nombre","tipo","parent","jefe"]);
    if (sortKey && allowed.has(sortKey)) {
      const getVal = (area, key) => {
        switch (key) {
          case "tipo": return area.cat_tipos_area?.nombre || "";
          case "parent": return area.parent?.nombre || "";
          case "jefe": return area.jefe?.nombre || "";
          default: return area[key] || "";
        }
      };
      mappedAreas.sort((a, b) => {
        let av = getVal(a, sortKey);
        let bv = getVal(b, sortKey);
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDirection === "asc" ? -1 : 1;
        if (av > bv) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return { areas: mappedAreas, tiposArea };
  } catch (error) {
    console.error("Error loading areas page data:", error);
    throw error;
  }
};

export const getAreas = async () => {
  const areas = await prisma.areas.findMany({
    include: {
      areas: true, // Parent area
      usuarios_areas_jefe_idTousuarios: true, // Boss
      cat_tipos_area: true // Area type
    },
    orderBy: {
      nombre: 'asc'
    }
  });

  // Map to clean relation names
  return areas.map(area => ({
    ...area,
    parent: area.areas,
    jefe: area.usuarios_areas_jefe_idTousuarios
  }));
};
