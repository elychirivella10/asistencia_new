import { useState } from "react";

export function useAreaTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [deletingArea, setDeletingArea] = useState(null);

  const handleCreate = () => {
    setEditingArea(null);
    setOpen(true);
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setOpen(true);
  };

  const handleAddSubArea = (parent) => {
    // Si parent es un objeto, extraemos el id, si es id directo, lo usamos
    const parentId = parent.id || parent;
    setEditingArea({ parent_id: parentId });
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingArea(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingArea,
    deletingArea,
    setDeletingArea,
    handleCreate,
    handleEdit,
    handleAddSubArea,
    handleSuccess
  };
}
