import { useState } from "react";

export function useUserTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [biometricUser, setBiometricUser] = useState(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const handleCreate = () => {
    setEditingUser(null);
    setOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleDelete = (user) => {
    setDeletingUser(user);
  };

  const handleBiometrics = (user) => {
    setBiometricUser(user);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingUser(null);
    setDeletingUser(null);
    setBiometricUser(null);
    setIsBulkAssignOpen(false);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingUser,
    deletingUser,
    setDeletingUser,
    biometricUser,
    setBiometricUser,
    isBulkAssignOpen,
    setIsBulkAssignOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleBiometrics,
    handleSuccess
  };
}
