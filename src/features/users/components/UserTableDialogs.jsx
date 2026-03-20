"use client";

import { UserFormDialog } from "./UserFormDialog";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { BulkAssignAreaDialog } from "./BulkAssignAreaDialog";

export function UserTableDialogs({
  open,
  onOpenChange,
  editingUser,
  areas,
  turnos,
  roles,
  deletingUser,
  setDeletingUser,
  isBulkAssignOpen,
  setIsBulkAssignOpen,
  selectedCount,
  onBulkAssign,
  onSuccess
}) {
  return (
    <>
      <UserFormDialog 
        open={open}
        onOpenChange={onOpenChange}
        editingUser={editingUser}
        areas={areas}
        turnos={turnos}
        roles={roles}
        onSuccess={onSuccess}
      />

      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
          onSuccess={onSuccess}
        />
      )}

      <BulkAssignAreaDialog
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedCount={selectedCount}
        onConfirm={onBulkAssign}
      />
    </>
  );
}
