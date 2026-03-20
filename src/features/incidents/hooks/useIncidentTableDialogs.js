import { useState } from "react";

export function useIncidentTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [deletingIncident, setDeletingIncident] = useState(null);

  const handleCreate = () => {
    setEditingIncident(null);
    setOpen(true);
  };

  const handleEdit = (incident) => {
    setEditingIncident(incident);
    setOpen(true);
  };

  const handleDelete = (incident) => {
    setDeletingIncident(incident);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingIncident(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingIncident,
    deletingIncident,
    setDeletingIncident,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess,
  };
}
