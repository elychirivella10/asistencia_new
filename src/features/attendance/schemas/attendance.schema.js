import { z } from "zod";

export const attendanceFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  areaId: z.string().optional(),
  searchTerm: z.string().optional(),
  status: z.string().optional(),
  llegada: z.string().optional(),
  salida: z.string().optional(),
  excepcion: z.string().optional(),
}).refine((data) => {
  if (data.from && data.to) {
    return data.from <= data.to;
  }
  return true;
}, {
  message: "La fecha de inicio no puede ser mayor que la fecha final",
  path: ["from"],
});
