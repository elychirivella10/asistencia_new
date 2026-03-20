'use server'

import { areaSchema } from '../schemas/area.schema'
import { revalidatePath } from 'next/cache'
import { validateAreaHierarchy } from '../services/area-validation.service'
import { createArea, updateArea, deleteArea as deleteAreaService } from '../services/area-write.service'
import { createProtectedAction, createProtectedFunction } from '@/features/shared/lib/safe-action'
import { ROUTES } from "@/features/shared/config/routes"
import { AREA_CONFIG } from '../config/area.constants'

/**
 * Server Action to save (create/edit) an area.
 */
export const saveArea = createProtectedAction(
  (data) => data.id ? AREA_CONFIG.PERMISSIONS.UPDATE : AREA_CONFIG.PERMISSIONS.WRITE, // Permiso dinámico
  areaSchema,
  async (data, session) => {
    try {
      const { id, nombre, parent_id, jefe_id, tipo_id } = data

      // Validate recursion: An area cannot be its own parent
      if (id && parent_id === id) {
         return { success: false, error: 'Un área no puede ser padre de sí misma.' }
      }

      // --- HIERARCHY VALIDATION ---
      const validation = await validateAreaHierarchy(tipo_id, parent_id, id);
      if (!validation.success) {
        return validation;
      }
      
      const dataToSave = {
        nombre,
        parent_id,
        jefe_id,
        tipo_id,
      }

      let result;
      if (id) {
        result = await updateArea(id, dataToSave)
      } else {
        result = await createArea(dataToSave)
      }

      if (result.success) {
        revalidatePath(ROUTES.ADMIN.AREAS)
        return { success: true, message: 'Área guardada correctamente' }
      }
      
      return { success: false, error: 'Error al guardar el área' }

    } catch (error) {
      console.error('Error saving area:', error)
      return { success: false, error: 'Error al guardar el área' }
    }
  }
)

/**
 * Server Action to delete an area.
 */
export const deleteArea = createProtectedFunction(
  AREA_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteAreaService(id);
      
      if (!result.success) {
        return result;
      }

      revalidatePath(ROUTES.ADMIN.AREAS)
      return { success: true, message: 'Área eliminada correctamente' }
    } catch (error) {
      console.error('Error deleting area:', error)
      return { success: false, error: 'Error al eliminar el área' }
    }
  }
)
