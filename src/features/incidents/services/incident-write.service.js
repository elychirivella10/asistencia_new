import prisma from "@/features/shared/lib/prisma";
import { INCIDENT_CONFIG } from "../config/incidents.constants";
import { validateIncidentExistence, validateIncidentUser } from "./incident-validation.service";
import { invalidateAttendanceCache } from "./incident-attendance-cache.service";
import { AUTH_CONFIG } from "@/features/auth/config/auth.constants";

function getDefaultStatusForSession(session) {
  // Incidents are now auto-approved on creation as per business rule.
  return INCIDENT_CONFIG.STATUS.APPROVED;
}

export async function createIncident(payload, session) {
  try {
    const userValidation = await validateIncidentUser(payload.usuario_id);
    if (!userValidation.success) {
      return userValidation;
    }

    const estado = getDefaultStatusForSession(session);

    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.novedades.create({
        data: {
          usuario_id: payload.usuario_id,
          tipo_id: payload.tipo,
          fecha_inicio: payload.fecha_inicio,
          fecha_fin: payload.fecha_fin,
          es_dia_completo: payload.es_dia_completo,
          hora_inicio: payload.hora_inicio,
          hora_fin: payload.hora_fin,
          observaciones: payload.observaciones || null,
          estado,
          // Auto-approved incidents are approved by the user creating them.
          aprobado_por: session.id,
        },
      });

      await invalidateAttendanceCache(
        tx,
        payload.usuario_id,
        payload.fecha_inicio,
        payload.fecha_fin,
        "Novedad registrada"
      );

      return created;
    });

    return { success: true, data: incident };
  } catch (error) {
    console.error("Error creating incident:", error);
    return { success: false, error: "Error al crear la novedad." };
  }
}

export async function updateIncident(id, payload, session) {
  try {
    const existingResult = await validateIncidentExistence(id);
    if (!existingResult.success) {
      return existingResult;
    }

    const existing = existingResult.data;

    const incident = await prisma.$transaction(async (tx) => {
      const updated = await tx.novedades.update({
        where: { id },
        data: {
          usuario_id: payload.usuario_id,
          tipo_id: payload.tipo,
          fecha_inicio: payload.fecha_inicio,
          fecha_fin: payload.fecha_fin,
          es_dia_completo: payload.es_dia_completo,
          hora_inicio: payload.hora_inicio,
          hora_fin: payload.hora_fin,
          observaciones: payload.observaciones || null,
          // Estado se mantiene; aprobación explícita podría ser futura extensión.
          aprobado_por: payload.aprobado_por ?? existing.aprobado_por,
        },
      });

      const startDate = payload.fecha_inicio < existing.fecha_inicio ? payload.fecha_inicio : existing.fecha_inicio;
      const endDate = payload.fecha_fin > existing.fecha_fin ? payload.fecha_fin : existing.fecha_fin;

      await invalidateAttendanceCache(
        tx,
        payload.usuario_id,
        startDate,
        endDate,
        "Novedad actualizada"
      );

      return updated;
    });

    return { success: true, data: incident };
  } catch (error) {
    console.error("Error updating incident:", error);
    return { success: false, error: "Error al actualizar la novedad." };
  }
}

export async function deleteIncident(id) {
  try {
    const existingResult = await validateIncidentExistence(id);
    if (!existingResult.success) {
      return existingResult;
    }

    const existing = existingResult.data;

    await prisma.$transaction(async (tx) => {
      await tx.novedades.delete({
        where: { id },
      });

      await invalidateAttendanceCache(
        tx,
        existing.usuario_id,
        existing.fecha_inicio,
        existing.fecha_fin,
        "Novedad eliminada"
      );
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting incident:", error);
    return { success: false, error: "Error al eliminar la novedad." };
  }
}

