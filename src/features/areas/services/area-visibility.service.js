import prisma from "@/features/shared/lib/prisma";
import { getAreasPermitidas } from "./area-hierarchy.service";
import { verifyPermission } from "@/features/auth/services/permission.service";
import { AREA_CONFIG } from "../config/area.constants";

export const getVisibleAreas = async (currentUser, term = "", { take } = {}) => {
  if (!currentUser) return [];

  const safeTerm = typeof term === "string" ? term : "";
  const safeTake = Number.isFinite(Number(take)) ? Math.max(1, Math.min(200, Number(take))) : undefined;

  const where = {
    nombre: { contains: safeTerm, mode: "insensitive" },
  };

  const canReadAll = await verifyPermission(currentUser.role, AREA_CONFIG.PERMISSIONS.READ_ALL);
  if (!canReadAll) {
    const allowedIds = await getAreasPermitidas(currentUser.id);
    if (allowedIds.length === 0) return [];
    where.id = { in: allowedIds };
  }

  return await prisma.areas.findMany({
    where,
    orderBy: { nombre: "asc" },
    ...(safeTake ? { take: safeTake } : {}),
    include: { 
      cat_tipos_area: true,
      areas: true,
      usuarios_areas_jefe_idTousuarios: true
    },
  });
};

