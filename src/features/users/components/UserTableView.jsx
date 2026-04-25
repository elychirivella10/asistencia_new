"use client";

import * as React from "react";
import { UserToolbar } from "./UserToolbar";
import { UserBulkActions } from "./UserBulkActions";
import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { UserTableDialogs } from "./UserTableDialogs";
import { useBiometricSync } from "../hooks/useBiometricSync";
import { Loader2 } from "lucide-react";
import { USER_CONFIG } from "../config/user.constants";

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
  onReset,
  data: { areas, turnos, roles },
  actions: { onBulkAssign },
  onSortChange
}) {
  const { isSyncing, handleSyncAllBiometrics } = useBiometricSync();
  const selectedUsers = selection?.selectedIds || new Set();
  const clearSelection = selection?.clearSelection;

  const { UI: { LABELS: { BIOMETRICS: { MESSAGES }, TABLE } } } = USER_CONFIG;

  const {
    open,
    onOpenChange,
    editingUser,
    deletingUser,
    setDeletingUser,
    biometricUser,
    setBiometricUser,
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
        onReset={onReset}
        onCreate={handleCreate}
        onSyncBiometrics={handleSyncAllBiometrics}
        isSyncing={isSyncing}
      />

      <UserBulkActions
        selectedCount={selectedUsers.size}
        onClearSelection={clearSelection || (() => { })}
        onBulkAssign={() => setIsBulkAssignOpen(true)}
      />

      <div className="relative rounded-md overflow-hidden">
        <div className={`transition-all duration-300 ${(isPending || isSyncing) ? "opacity-40 pointer-events-none blur-[1px]" : "opacity-100"}`}>
          <DataTable
            data={users || []}
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleServerSort}
            selection={selection}
            emptyMessage={(filters?.searchTerm || "") ? TABLE.EMPTY_SEARCH : TABLE.EMPTY_DATA}
          />
        </div>

        {isSyncing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center p-6 bg-background/95 rounded-xl shadow-lg border border-border/50 animate-in fade-in zoom-in-95 duration-200">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold tracking-tight">{MESSAGES.BLOCK_TITLE}</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-[250px]">
                {MESSAGES.BLOCK_DESC}
              </p>
            </div>
          </div>
        )}
      </div>

      <TablePagination
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        currentCount={(users || []).length}
        totalCount={pagination?.totalCount || 0}
        entityName={TABLE.ENTITY_NAME}
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
        biometricUser={biometricUser}
        setBiometricUser={setBiometricUser}
        isBulkAssignOpen={isBulkAssignOpen}
        setIsBulkAssignOpen={setIsBulkAssignOpen}
        selectedCount={selectedUsers.size}
        onBulkAssign={onBulkAssign}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
