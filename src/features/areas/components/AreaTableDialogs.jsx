"use client";

import { AreaFormDialog } from "./AreaFormDialog";
import { AreaDeleteDialog } from "./AreaDeleteDialog";

export function AreaTableDialogs({
  open,
  onOpenChange,
  editingArea,
  deletingArea,
  setDeletingArea,
  areas,
  tiposArea,
  onSuccess
}) {
  return (
    <>
      <AreaFormDialog
        open={open}
        onOpenChange={onOpenChange}
        area={editingArea}
        areas={areas}
        tiposArea={tiposArea}
        onSuccess={onSuccess}
      />

      {deletingArea && (
        <AreaDeleteDialog 
          area={deletingArea}
          onOpenChange={(isOpen) => !isOpen && setDeletingArea(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
