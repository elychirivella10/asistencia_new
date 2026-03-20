"use server";

import { revalidatePath } from "next/cache";
import { userSchema, bulkAssignSchema } from "../schemas/user.schema";
import { createProtectedAction, createProtectedFunction } from "@/lib/safe-action";
import { validateUserUniqueness } from "../services/user-validation.service";
import { createUser, updateUser, bulkAssignArea,  deleteUser as deleteUserService } from "../services/user-write.service";
import { ROUTES } from "@/config/routes";
import { USER_CONFIG } from "../config/user.constants";

/**
 * Server Action to save (create/edit) a user.
 * Dynamically protected: requires 'users:create' or 'users:update'.
 */
export const saveUser = createProtectedAction(
  // 1. Dynamic permission
  (data) => data.id ? USER_CONFIG.PERMISSIONS.UPDATE : USER_CONFIG.PERMISSIONS.WRITE,
  
  // 2. Validation schema
  userSchema,
  
  // 3. Business handler
  async (data, session) => {
    // Check duplicates (Specific business logic)
    const uniquenessCheck = await validateUserUniqueness(data.cedula, data.email, data.id);
    if (!uniquenessCheck.success) {
      return uniquenessCheck;
    }

    // Prepare data for Prisma
    const dataToSave = {
      nombre: data.nombre,
      apellido: data.apellido,
      cedula: data.cedula,
      email: data.email,
      area_id: data.area_id,
      turno_id: data.turno_id,
      rol_id: data.rol_id,
      es_activo: data.es_activo,
    };

    let result;
    if (data.id) {
      result = await updateUser(data.id, dataToSave, session);
    } else {
      result = await createUser(dataToSave, session);
    }

    if (result.success) {
        revalidatePath(ROUTES.ADMIN.USUARIOS);
        return { success: true, message: "Usuario guardado exitosamente." };
    }
    
    return result; // If service failed
  }
);

/**
 * Server Action to delete user.
 * Statically protected: requires 'users:delete'.
 */
export const deleteUser = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.DELETE,
  async (id, session) => { // createProtectedFunction passes (arg1, arg2..., session)
      const result = await deleteUserService(id);
      if (result.success) {
          revalidatePath(ROUTES.ADMIN.USUARIOS);
      }
      return result;
  }
);

// --- Bulk Actions ---

/**
 * Bulk assigns an area to a list of users.
 * Protected Action: requires 'users:update'
 */
export const assignUsersToArea = createProtectedAction(
  USER_CONFIG.PERMISSIONS.UPDATE,
  bulkAssignSchema,
  async (data, session) => {
    try {
      const { userIds, areaId } = data;
      const result = await bulkAssignArea(userIds, areaId, session);
      
      if (result.success) {
          revalidatePath(ROUTES.ADMIN.USUARIOS);
      }

      return result;

    } catch (error) {
      console.error("Error en assignUsersToArea:", error);
      return { success: false, error: "Error interno al asignar usuarios." };
    }
  }
);
