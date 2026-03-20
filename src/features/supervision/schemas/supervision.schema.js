import { z } from "zod";

export const supervisionSchema = z.object({
  id: z.string().optional(),
  usuario_id: z.string({ required_error: "El usuario es requerido" }).min(1, "El usuario es requerido"),
  area_id: z.string({ required_error: "El área es requerida" }).min(1, "El área es requerida"),
});
