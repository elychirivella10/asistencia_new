"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";

/**
 * Dialog for creating or editing a user.
 */
export function UserFormDialog({ 
  open, 
  onOpenChange, 
  editingUser, 
  areas, 
  turnos,
  roles, 
  onSuccess 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser 
              ? "Modifica la información del usuario existente." 
              : "Completa el formulario para registrar un nuevo usuario en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={editingUser}
          areas={areas}
          turnos={turnos}
          roles={roles}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
