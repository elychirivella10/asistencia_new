import { z } from "zod";

/**
 * Esquema de validación para Usuarios.
 * Validaciones:
 * - cedula: Mínimo 3 caracteres, obligatorio.
 * - email: Formato email válido.
 * - nombre: Mínimo 2 caracteres.
 * - apellido: Mínimo 2 caracteres.
 * - area_id: UUID válido (obligatorio).
 * - turno_id: UUID válido (obligatorio).
 */
export const userSchema = z.object({
  id: z.string().nullish().or(z.literal('')),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  cedula: z.string().min(3, "La cédula es obligatoria"),
  email: z.string().email("Email inválido"),
  rol_id: z.coerce.number().min(1, "Debes seleccionar un rol"),
  area_id: z.string().uuid("Debes seleccionar un área"),
  turno_id: z.string().uuid("Debes seleccionar un turno"),
  es_activo: z.preprocess(
    (val) => val === 'on' || val === 'true' || val === true,
    z.boolean()
  ).default(true),
});

export const bulkAssignSchema = z.object({
  userIds: z.array(z.string()).min(1, "Debe seleccionar al menos un usuario."),
  areaId: z.string().min(1, "Debe seleccionar un área."),
});
