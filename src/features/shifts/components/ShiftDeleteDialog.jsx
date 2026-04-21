"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteShiftAction } from "../actions/shift-write.action";
import { toast } from "sonner";

export function ShiftDeleteDialog({ shift, onOpenChange, onSuccess }) {
  const handleDelete = async () => {
    if (!shift) return;
    const result = await deleteShiftAction(shift.id);
    if (result.success) {
      toast.success(result.message);
      onSuccess?.();
    } else {
      toast.error(result.error || result.message);
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={!!shift} onOpenChange={(open) => !open && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el turno <strong>{shift?.nombre}</strong>.
            Si hay usuarios asociados, la base de datos bloqueará la operación por seguridad.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant="destructive">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
