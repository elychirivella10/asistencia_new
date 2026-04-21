"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShiftForm } from "./ShiftForm";

export function ShiftFormDialog({ open, onOpenChange, shift, onSuccess }) {
  const isEditing = !!shift;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Turno" : "Crear Nuevo Turno"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los detalles del turno y guarde los cambios."
              : "Complete el formulario para registrar un nuevo turno en el sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <ShiftForm 
          shift={shift} 
          onSuccess={() => {
            onSuccess?.(); // Para que ShiftTableDialogs limpie state si fuera necesario
            onOpenChange(false);
          }} 
        />
      </DialogContent>
    </Dialog>
  );
}
