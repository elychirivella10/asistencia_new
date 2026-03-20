"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { getVisibleAreas } from "../services/area-visibility.service";
import { findAreas, findParentAreas } from "../services/area-search.service";
import { AREA_CONFIG } from "../config/area.constants";

/**
 * Searches for areas.
 * Defaults to secure visible areas search.
 * @param {string} term
 */
export const searchAreas = createProtectedFunction(AREA_CONFIG.PERMISSIONS.READ, async (term, session) => {
  const q = typeof term === "string" ? term.trim() : "";
  const take = q.length >= 3 ? 200 : q.length >= 2 ? 50 : 25;
  return await getVisibleAreas(session, q, { take });
});

/**
 * Searches for ALL areas (Admin only).
 * @param {string} term
 */
export const searchAllAreas = createProtectedFunction(AREA_CONFIG.PERMISSIONS.READ_ALL, async (term, session) => {
  const q = typeof term === "string" ? term.trim() : "";
  const take = q.length >= 3 ? 200 : q.length >= 2 ? 50 : 25;
  return await findAreas(q, { take });
});

/**
 * Searches for areas respecting user permissions and hierarchy.
 * @param {string} term
 */
export const searchVisibleAreas = createProtectedFunction(AREA_CONFIG.PERMISSIONS.READ, async (term, session) => {
  const q = typeof term === "string" ? term.trim() : "";
  const take = q.length >= 3 ? 200 : q.length >= 2 ? 50 : 25;
  return await getVisibleAreas(session, q, { take });
});

/**
 * Searches for areas that can serve as parent, respecting hierarchy.
 * 
 * @param {string} term - Search term
 * @param {string} [currentAreaId] - ID of the area being edited (to avoid self-selection)
 * @param {number} [selectedNivel] - Hierarchy level of the selected area type (to filter valid parents)
 */
export const searchParentAreas = createProtectedFunction(AREA_CONFIG.PERMISSIONS.READ, async (term, currentAreaId, selectedNivel, session) => {
  const q = typeof term === "string" ? term.trim() : "";
  const take = q.length >= 3 ? 200 : q.length >= 2 ? 50 : 25;
  return await findParentAreas(q, currentAreaId, selectedNivel, session, { take });
});
