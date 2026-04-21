"use client";

import { ShiftFormDialog } from "./ShiftFormDialog";
import { ShiftDeleteDialog } from "./ShiftDeleteDialog";

export function ShiftTableDialogs({
  open,
  onOpenChange,
  editingShift,
  deletingShift,
  setDeletingShift,
  onSuccess
}) {
  return (
    <>
      <ShiftFormDialog
        open={open}
        onOpenChange={onOpenChange}
        shift={editingShift}
        onSuccess={onSuccess}
      />

      {deletingShift && (
        <ShiftDeleteDialog
          shift={deletingShift}
          onOpenChange={(isOpen) => !isOpen && setDeletingShift(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
