"use client";

import { UserToolbar } from "./UserToolbar";
import { UserBulkActions } from "./UserBulkActions";
import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { UserTableDialogs } from "./UserTableDialogs";

export function UserTableView({
  users,
  isPending,
  pagination,
  filters,
  sortConfig,
  onSearchChange,
  onAreaChange,
  onStatusChange,
  onPageChange,
  dialogState,
  columns,
  selection,
  data: { areas, turnos, roles },
  actions: { onBulkAssign },
  onSortChange
}) {
  const selectedUsers = selection?.selectedIds || new Set();
  const clearSelection = selection?.clearSelection;

  const {
    open,
    onOpenChange,
    editingUser,
    deletingUser,
    setDeletingUser,
    isBulkAssignOpen,
    setIsBulkAssignOpen,
    handleCreate,
    handleSuccess
  } = dialogState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    if (onSortChange) onSortChange(key, nextDir);
  };

  return (
    <div className="space-y-4">
      <UserToolbar
        searchTerm={filters?.searchTerm || ""}
        onSearchChange={onSearchChange}
        areaFilter={filters?.areaId || "all"}
        onAreaChange={onAreaChange}
        statusFilter={filters?.status || "all"}
        onStatusChange={onStatusChange}
        areas={areas}
        onCreate={handleCreate}
      />

      <UserBulkActions
        selectedCount={selectedUsers.size}
        onClearSelection={clearSelection || (() => {})}
        onBulkAssign={() => setIsBulkAssignOpen(true)}
      />

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <DataTable
          data={users || []}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleServerSort}
          selection={selection}
          emptyMessage={(filters?.searchTerm || "") ? "No se encontraron usuarios." : "No hay usuarios registrados."}
        />
      </div>

      <TablePagination
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        currentCount={(users || []).length}
        totalCount={pagination?.totalCount || 0}
        entityName="usuarios"
      />

      <UserTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingUser={editingUser}
        areas={areas}
        turnos={turnos}
        roles={roles}
        deletingUser={deletingUser}
        setDeletingUser={setDeletingUser}
        isBulkAssignOpen={isBulkAssignOpen}
        setIsBulkAssignOpen={setIsBulkAssignOpen}
        selectedCount={selectedUsers.size}
        onBulkAssign={onBulkAssign}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
