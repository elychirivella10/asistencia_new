import { z } from "zod";

export const roleSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  descripcion: z.string().optional(),
  permisos: z.array(z.number()).min(1, "Debe seleccionar al menos un permiso"),
});

export const saveRoleSchema = roleSchema.extend({
  id: z.number().optional(),
});
