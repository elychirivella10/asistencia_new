"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getIncidentColumns } from "../config/incident-table.config";
import { useIncidentTable } from "../hooks/useIncidentTable";
import { useIncidentTableDialogs } from "../hooks/useIncidentTableDialogs";
import { usePermission } from "@/features/auth/components/permissions-provider";
import { IncidentTableView } from "./IncidentTableView";

export function IncidentTable({ data, incidentTypes }) {
  const { can } = usePermission();
  const tableState = useIncidentTable(data);
  const dialogState = useIncidentTableDialogs();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    handleEdit,
    handleDelete,
    isDialogOpen,
    setIsDialogOpen,
    editingIncident,
    deletingIncident,
    setDeletingIncident
  } = dialogState;

  // Placeholder for view action if needed, currently not implemented in hook
  const handleView = (row) => {
    // Implement view logic or pass from hook
  };

  const columns = useMemo(() => getIncidentColumns(handleView, handleEdit, handleDelete, can), [handleEdit, handleDelete, can]);

  const handleSuccess = () => setIsDialogOpen(false);

  const handleSortChange = (key, direction) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("sortKey", key); else params.delete("sortKey");
    if (direction) params.set("sortDirection", direction); else params.delete("sortDirection");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <IncidentTableView
      tableState={tableState}
      dialogState={dialogState}
      columns={columns}
      data={{ incidentTypes }}
      onSortChange={handleSortChange}
    />
  );
}
