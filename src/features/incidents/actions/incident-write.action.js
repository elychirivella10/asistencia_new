"use server";

import { revalidatePath } from "next/cache";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import { incidentBaseSchema, timeValidationRefine, timeValidationParams } from "../schemas/incident.schema";
import { createIncident, updateIncident, deleteIncident as deleteIncidentService } from "../services/incident-write.service";
import { ROUTES } from "@/features/shared/config/routes";
import { parseTime } from "@/features/shared/lib/date-utils";
import { z } from "zod";
import { INCIDENT_CONFIG } from "../config/incidents.constants";

// Esquema unificado para Crear/Editar
const saveIncidentSchema = incidentBaseSchema.extend({
    id: z.string().uuid().optional()
}).refine(timeValidationRefine, timeValidationParams);

/**
 * Server Action to save (create/update) a novelty.
 */
export const saveIncident = createProtectedAction(
  (data) => data.id ? INCIDENT_CONFIG.PERMISSIONS.UPDATE : INCIDENT_CONFIG.PERMISSIONS.WRITE,
  saveIncidentSchema,
  async (data, session) => {
    try {
      // Transformar datos comunes
      const payload = {
        usuario_id: data.usuario_id,
        tipo: data.tipo,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        es_dia_completo: data.es_dia_completo,
        hora_inicio: !data.es_dia_completo ? parseTime(data.hora_inicio) : null,
        hora_fin: !data.es_dia_completo ? parseTime(data.hora_fin) : null,
        observaciones: data.observaciones,
        // El estado se define en el servicio (por defecto APROBADO para administradores)
        aprobado_por: session.id,
      };

      let result;
      if (data.id) {
        result = await updateIncident(data.id, payload, session);
      } else {
        result = await createIncident(payload, session);
      }

      if (result.success) {
        revalidatePath(ROUTES.ATTENDANCE);
        revalidatePath(ROUTES.INCIDENTS);
        return { 
            success: true, 
            message: data.id ? "Novedad actualizada correctamente." : "Novedad registrada y procesada correctamente." 
        };
      }
      
      return result;

    } catch (error) {
      console.error("Error saving incident:", error);
      return { success: false, error: "Error inesperado al guardar la novedad." };
    }
  }
);

/**
 * Action to delete a novelty.
 */
export const deleteIncident = createProtectedFunction(
  INCIDENT_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteIncidentService(id);
      if (result.success) {
        revalidatePath(ROUTES.ATTENDANCE);
        revalidatePath(ROUTES.ADMIN.INCIDENTS);
        return { success: true, message: "Novedad eliminada correctamente" };
      }
      return result;
    } catch (error) {
      console.error("Error deleting incident:", error);
      return { success: false, error: "Error al eliminar la novedad." };
    }
  }
);
