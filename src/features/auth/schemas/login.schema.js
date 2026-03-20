import { z } from 'zod'

export const loginSchema = z.object({
  cedula: z.string().min(1, 'La cédula es requerida'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})