'use server'

import { shiftSchema } from '../schemas/shift.schema'
import { revalidatePath } from 'next/cache'
import { createShift, updateShift, deleteShift as deleteShiftService } from '../services/shift-write.service'
import { createProtectedAction, createProtectedFunction } from '@/features/shared/lib/safe-action'
import { ROUTES } from "@/features/shared/config/routes"
import { SHIFT_CONFIG } from '../config/shift.constants'

export const saveShift = createProtectedAction(
  (data) => data.id ? SHIFT_CONFIG.PERMISSIONS.UPDATE : SHIFT_CONFIG.PERMISSIONS.CREATE,
  shiftSchema,
  async (data, session) => {
    try {
      const { id } = data;

      if (id) {
        await updateShift(id, data);
      } else {
        await createShift(data);
      }

      revalidatePath(ROUTES.ADMIN.TURNOS.path)
      return { success: true, message: id ? 'Turno actualizado correctamente' : 'Turno creado exitosamente' }

    } catch (error) {
      console.error('Error saving shift:', error)
      if (error.code === 'P2002') {
        return { success: false, error: "Ya existe un turno con esos datos específicos" };
      }
      return { success: false, error: 'Error interno del servidor al guardar el turno. Contacte a soporte.' }
    }
  }
)

export const deleteShiftAction = createProtectedFunction(
  SHIFT_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      await deleteShiftService(id);

      revalidatePath(ROUTES.ADMIN.TURNOS.path)
      return { success: true, message: 'Turno eliminado' }
    } catch (error) {
      console.error('Error deleting shift:', error)
      return { success: false, error: error.message || 'No se pudo eliminar el turno' }
    }
  }
)
