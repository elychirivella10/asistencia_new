import { z } from "zod";

const stringOrArray = z.union([z.string(), z.array(z.string())]).optional();

/**
 * Base validation schema for date range and common filters.
 */
const baseFilterSchema = z.object({
  fechaDesde: z.coerce.date(),
  fechaHasta: z.coerce.date(),
  areaId: stringOrArray,
  searchTerm: z.string().optional(),
  status: stringOrArray,
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  sortKey: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
}).refine(
  (data) => data.fechaDesde <= data.fechaHasta,
  {
    message: "La fecha de inicio no puede ser posterior a la fecha de fin.",
    path: ["fechaDesde"],
  }
);

/**
 * Strict schema for the Consolidated Attendance Report.
 */
export const attendanceFilterSchema = baseFilterSchema.extend({
  llegada: stringOrArray,
  salida: stringOrArray,
  excepcion: stringOrArray,
});

/**
 * Strict schema for the Novedades & Permission Report.
 */
export const novedadesFilterSchema = baseFilterSchema.extend({
  tipoPermisoId: z.string().optional(),
});
