import { useState } from "react";

export function useRoleTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);

  const handleCreate = () => {
    setEditingRole(null);
    setOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setOpen(true);
  };

  const handleDelete = (role) => {
    setDeletingRole(role);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingRole(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingRole,
    deletingRole,
    setDeletingRole,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess
  };
}
