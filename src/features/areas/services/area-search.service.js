import prisma from "@/features/shared/lib/prisma";
import { getAreasPermitidas } from "./area-hierarchy.service";
import { verifyPermission } from "@/features/auth/services/permission.service";
import { AREA_CONFIG } from "../config/area.constants";

export const findAreas = async (term, { take } = {}) => {
  const safeTerm = typeof term === "string" ? term : "";
  const safeTake = Number.isFinite(Number(take)) ? Math.max(1, Math.min(200, Number(take))) : undefined;

  return await prisma.areas.findMany({
    where: {
      nombre: { contains: safeTerm, mode: "insensitive" },
    },
    ...(safeTake ? { take: safeTake } : {}),
    orderBy: { nombre: "asc" },
    include: { cat_tipos_area: true },
  });
};

export const findParentAreas = async (term, currentAreaId, selectedNivel, currentUser, { take } = {}) => {
  if (!currentUser) return [];

  const safeTerm = typeof term === "string" ? term : "";
  const safeTake = Number.isFinite(Number(take)) ? Math.max(1, Math.min(200, Number(take))) : undefined;
  const safeNivel = Number.isFinite(Number(selectedNivel)) ? Number(selectedNivel) : null;

  const and = [
    { nombre: { contains: safeTerm, mode: "insensitive" } },
  ];

  if (currentAreaId) and.push({ id: { not: currentAreaId } });

  if (safeNivel !== null) {
    and.push({
      cat_tipos_area: {
        nivel_jerarquico: { lt: safeNivel },
      },
    });
  }

  const canReadAll = await verifyPermission(currentUser.role, AREA_CONFIG.PERMISSIONS.READ_ALL);
  if (!canReadAll) {
    const allowedIds = await getAreasPermitidas(currentUser.id);
    if (allowedIds.length === 0) return [];
    and.push({ id: { in: allowedIds } });
  }

  return await prisma.areas.findMany({
    where: { AND: and },
    ...(safeTake ? { take: safeTake } : {}),
    orderBy: { nombre: "asc" },
    include: { cat_tipos_area: true },
  });
};

