"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { saveRoleSchema } from "../schemas/role.schema";
import {
  createRole as createRoleService,
  updateRole as updateRoleService,
  deleteRole as deleteRoleService,
} from "../services/role-write.service";
import { createProtectedAction, createProtectedFunction } from "@/lib/safe-action";
import { ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "../config/role.constants";

/**
 * Server Action para crear o actualizar roles.
 * Protegido dinámicamente: roles:create o roles:update
 */
export const saveRole = createProtectedAction(
  (data) => data.id ? ROLE_CONFIG.PERMISSIONS.UPDATE : ROLE_CONFIG.PERMISSIONS.WRITE,
  saveRoleSchema,
  async (data, session) => {
    try {
      // Whitelisting explícito
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        permisos: data.permisos,
      };

      let result;
      if (data.id) {
        result = await updateRoleService(data.id, payload);
      } else {
        result = await createRoleService(payload);
      }

      if (result.success) {
        revalidatePath(ROUTES.ADMIN.ROLES);
        return { 
          success: true, 
          message: data.id ? "Rol actualizado correctamente" : "Rol creado correctamente" 
        };
      }

      return result;

    } catch (error) {
        console.error("Error saving role:", error);
        return { success: false, error: "Error inesperado al guardar el rol" };
    }
  }
);

/**
 * Server Action para eliminar rol.
 */
export const deleteRole = createProtectedFunction(
  ROLE_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteRoleService(id);
      
      if (result.success) {
        revalidatePath(ROUTES.ADMIN.ROLES);
        return { success: true, message: "Rol eliminado correctamente" };
      }
      
      return result;

    } catch (error) {
      console.error("Error deleting role:", error);
      return { success: false, error: "Error inesperado al eliminar el rol" };
    }
  }
);
