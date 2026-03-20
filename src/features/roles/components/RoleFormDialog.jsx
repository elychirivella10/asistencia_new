"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleForm } from "./RoleForm";

export function RoleFormDialog({ open, onOpenChange, role, permissions }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{role ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
        </DialogHeader>
        <RoleForm
          role={role}
          permissions={permissions}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
