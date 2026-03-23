import { z } from "zod";

/**
 * Base validation schema for date range and common filters.
 */
const baseFilterSchema = z.object({
  fechaDesde: z.string().min(1, "La fecha de inicio es obligatoria"),
  fechaHasta: z.string().min(1, "La fecha de fin es obligatoria"),
  areaId: z.string().optional(),
  searchTerm: z.string().optional(),
  status: z.string().optional(),
}).refine(
  (data) => new Date(data.fechaDesde) <= new Date(data.fechaHasta),
  {
    message: "La fecha de inicio no puede ser posterior a la fecha de fin.",
    path: ["fechaDesde"],
  }
);

/**
 * Strict schema for the Consolidated Attendance Report.
 */
export const attendanceFilterSchema = baseFilterSchema.extend({
  llegada: z.string().optional(),
  salida: z.string().optional(),
  excepcion: z.string().optional(),
});

/**
 * Strict schema for the Novedades & Permission Report.
 */
export const novedadesFilterSchema = baseFilterSchema.extend({
  tipoPermisoId: z.string().optional(),
});
