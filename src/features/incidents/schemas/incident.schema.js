import { z } from "zod";
import { INCIDENT_CONFIG } from "../config/incidents.constants";

// 1. Definimos el objeto base puro (sin refine) para permitir manipulaciones (.omit, .pick)
export const incidentBaseSchema = z.object({
  usuario_id: z.string().uuid({ message: "Seleccione un empleado válido" }),
  tipo: z.coerce.number({ invalid_type_error: "Seleccione un tipo de novedad" }),
  fecha_inicio: z.date({ required_error: "Fecha inicio requerida" }),
  fecha_fin: z.date({ required_error: "Fecha fin requerida" }),
  es_dia_completo: z.boolean().default(true),
  hora_inicio: z.string().optional(),
  hora_fin: z.string().optional(),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
  estado: z.enum([
    INCIDENT_CONFIG.STATUS.PENDING, 
    INCIDENT_CONFIG.STATUS.APPROVED, 
    INCIDENT_CONFIG.STATUS.REJECTED
  ]).default(INCIDENT_CONFIG.STATUS.APPROVED),
});

// 2. Definimos la regla de validación de horas por separado
export const timeValidationRefine = (data) => {
  if (!data.es_dia_completo) {
    return !!data.hora_inicio && !!data.hora_fin;
  }
  return true;
};

export const timeValidationParams = {
  message: "Debe especificar hora de inicio y fin para permisos parciales",
  path: ["hora_inicio"],
};

// 3. Exportamos el esquema completo para uso en Frontend (React Hook Form)
export const incidentSchema = incidentBaseSchema.refine(timeValidationRefine, timeValidationParams);

// 4. Esquema para actualización (incluye ID)
export const incidentUpdateSchema = incidentBaseSchema.extend({
  id: z.string().uuid(),
}).refine(timeValidationRefine, timeValidationParams);
