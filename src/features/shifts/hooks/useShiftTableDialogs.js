import { useState } from "react";

export function useShiftTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deletingShift, setDeletingShift] = useState(null);

  const handleCreate = () => {
    setEditingShift(null);
    setOpen(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingShift(null);
    setDeletingShift(null);
  };

  const onOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setEditingShift(null), 200);
    }
  };

  return {
    open,
    onOpenChange,
    editingShift,
    deletingShift,
    setDeletingShift,
    handleCreate,
    handleEdit,
    handleSuccess,
  };
}
