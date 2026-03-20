'use server'

import { supervisionSchema } from '../schemas/supervision.schema'
import { revalidatePath } from 'next/cache'
import { createSupervision, deleteSupervision as deleteSupervisionService, updateSupervision } from '../services/supervision-write.service'
import { validateSupervisionUniqueness } from '../services/supervision-validation.service'
import { createProtectedAction, createProtectedFunction } from '@/features/shared/lib/safe-action'
import { ROUTES } from '@/features/shared/config/routes'
import { SUPERVISION_CONFIG } from '../config/supervision.constants'

export const saveSupervision = createProtectedAction(
  (data) => data.id ? SUPERVISION_CONFIG.PERMISSIONS.UPDATE : SUPERVISION_CONFIG.PERMISSIONS.WRITE,
  supervisionSchema,
  async (data, session) => {
    try {
      const { id, usuario_id, area_id } = data

      // Check uniqueness if creating
      if (!id) {
          const validation = await validateSupervisionUniqueness(usuario_id, area_id);
          if (!validation.success) {
              return validation;
          }
      }

      let result;
      if (id) {
        result = await updateSupervision(id, { usuario_id, area_id }, session);
      } else {
        result = await createSupervision({ usuario_id, area_id }, session);
      }

      if (result.success) {
        revalidatePath(ROUTES.ADMIN.SUPERVISION)
        return { success: true, message: 'Permiso guardado correctamente' }
      }
      
      return result

    } catch (error) {
      console.error('Error saving supervision:', error)
      return { success: false, error: 'Error inesperado al guardar el permiso' }
    }
  }
)

export const deleteSupervision = createProtectedFunction(
  SUPERVISION_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteSupervisionService(id);
      
      if (!result.success) {
        return result;
      }

      revalidatePath(ROUTES.ADMIN.SUPERVISION)
      return { success: true, message: 'Permiso eliminado correctamente' }
    } catch (error) {
      console.error('Error deleting supervision:', error)
      return { success: false, error: 'Error inesperado al eliminar el permiso' }
    }
  }
)
