"use client";

import { RoleFormDialog } from "./RoleFormDialog";
import { RoleDeleteDialog } from "./RoleDeleteDialog";

export function RoleTableDialogs({
  open,
  onOpenChange,
  editingRole,
  deletingRole,
  setDeletingRole,
  permissions,
  onSuccess
}) {
  return (
    <>
      <RoleFormDialog
        open={open}
        onOpenChange={onOpenChange}
        role={editingRole}
        permissions={permissions}
        onSuccess={onSuccess}
      />

      {deletingRole && (
        <RoleDeleteDialog
          role={deletingRole}
          open={!!deletingRole}
          onOpenChange={(open) => !open && setDeletingRole(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
