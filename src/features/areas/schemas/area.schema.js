import { z } from "zod";

export const areaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  // Pre-procesar: si es string vacío, convertir a null, sino dejar pasar
  parent_id: z.preprocess(val => val === '' ? null : val, z.string().optional().nullable()),
  jefe_id: z.preprocess(val => val === '' ? null : val, z.string().optional().nullable()),
  tipo_id: z.preprocess(val => val === '' ? null : val, z.coerce.number().optional().nullable()),
});
