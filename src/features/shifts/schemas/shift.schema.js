import { z } from "zod";

// Helpers para procesar la hora si viene como string HH:mm y queremos asegurar consistencia
export const shiftSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  
  // Asumiremos que el frontend envía la hora en string HH:mm o ya como un ISO
  hora_entrada: z.string().min(4, "Hora de entrada es obligatoria"),
  hora_salida: z.string().min(4, "Hora de salida es obligatoria"),
  
  margen_tolerancia_min: z.coerce.number().min(0).default(15),
  
  // Array de enteros para los días (1=Lunes, 7=Domingo). Requiere al menos 1 día seleccionado.
  dias_laborales: z.array(z.coerce.number()).min(1, "Debe seleccionar al menos un día laboral"),
  
  cruza_medianoche: z.preprocess(val => val === 'true' || val === true, z.boolean().default(false)),
});
