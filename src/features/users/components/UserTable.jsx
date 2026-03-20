 "use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { usePermission } from "@/providers/permissions-provider";
import { assignUsersToArea } from "../actions/user-write.action";
import { getUserTableColumns } from "../config/user-table.config";
import { useUserTableDialogs } from "../hooks/useUserTableDialogs";
import { useUserSelection } from "../hooks/useUserSelection";
import { useUserTableFilters } from "../hooks/useUserTableFilters";
import { UserTableView } from "./UserTableView";

/**
 * Main Users Table Component (Container).
 * Orchestrates selection, filters, sorting and dialogs using dedicated hooks.
 */
export function UserTable({ data, areas, turnos, roles, pagination }) {
  const { can } = usePermission();

  // Dialogs state
  const dialogState = useUserTableDialogs();

  // Selection state (rows)
  const selection = useUserSelection(data);

  // Filters, pagination and sorting synced with URL
  const { isPending, filters, paginationState, sortConfig, handlers } =
    useUserTableFilters(pagination);

  const columns = useMemo(
    () => getUserTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  const handleBulkAssign = async (areaId) => {
    const result = await assignUsersToArea(Array.from(selection.selectedIds), areaId);
    if (result.success) {
      toast.success(result.message);
      selection.clearSelection();
      dialogState.handleSuccess();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <UserTableView
      users={data}
      isPending={isPending}
      pagination={paginationState}
      filters={filters}
      sortConfig={sortConfig}
      onSearchChange={handlers.handleSearchChange}
      onAreaChange={handlers.handleAreaChange}
      onStatusChange={handlers.handleStatusChange}
      onPageChange={handlers.handlePageChange}
      dialogState={dialogState}
      columns={columns}
      selection={selection}
      data={{ areas, turnos, roles }}
      actions={{ onBulkAssign: handleBulkAssign }}
      onSortChange={handlers.handleSortChange}
    />
  );
}

