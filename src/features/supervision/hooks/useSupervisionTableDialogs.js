import { useState } from "react";

export function useSupervisionTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingSupervision, setEditingSupervision] = useState(null);
  const [deletingSupervision, setDeletingSupervision] = useState(null);

  const handleCreate = () => {
    setEditingSupervision(null);
    setOpen(true);
  };

  const handleEdit = (supervision) => {
    setEditingSupervision(supervision);
    setOpen(true);
  };

  const handleDelete = (supervision) => {
    setDeletingSupervision(supervision);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingSupervision(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingSupervision,
    deletingSupervision,
    setDeletingSupervision, // Direct setter needed for delete dialog state
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess
  };
}
