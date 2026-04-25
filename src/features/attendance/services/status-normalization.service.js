import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

const { CATEGORIES } = ATTENDANCE_CONFIG.BUSINESS;

export function normalizeStatusSlug(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

export function normalizeCategory(value) {
  const v = String(value || "").trim();
  return v ? v.toUpperCase() : CATEGORIES.ATTENDANCE;
}

/**
 * Builds a grouping function from catalog statuses.
 * @param {Array<{slug?: string, es_no_laborable?: boolean, categoria?: string}>} statuses
 * @returns {(slug: string) => string}
 */
export function buildStatusGrouping(statuses = []) {
  const map = new Map();
  statuses.forEach(s => {
    const slug = normalizeStatusSlug(s.slug);
    if (!slug) return;
    map.set(slug, {
      esNoLaborable: !!s.es_no_laborable,
      categoria: s.categoria
    });
  });

  return (slugInput) => {
    const slug = normalizeStatusSlug(slugInput);
    const meta = map.get(slug) || { esNoLaborable: false, categoria: CATEGORIES.ATTENDANCE };
    if (meta.esNoLaborable) return CATEGORIES.JUSTIFIED;
    return normalizeCategory(meta.categoria);
  };
}
