"use client";

import { DataTable } from "@/components/shared/DataTable";
import { SupervisionToolbar } from "./SupervisionToolbar";
import { SupervisionTableDialogs } from "./SupervisionTableDialogs";

export function SupervisionTableView({
  tableState,
  dialogState,
  columns,
  onSortChange
}) {
  const {
    filteredSupervisions,
    paginatedSupervisions,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    handleSearchChange,
    sortConfig,
    handleSort
  } = tableState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    handleSort(key);
    if (onSortChange) onSortChange(key, nextDir);
  };

  return (
    <div className="space-y-4">
      <SupervisionToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onCreate={dialogState.handleCreate}
      />
      
      <DataTable
        data={paginatedSupervisions}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        sortConfig={sortConfig}
        onSort={handleServerSort}
      />

      <SupervisionTableDialogs
        open={dialogState.open}
        onOpenChange={dialogState.onOpenChange}
        editingSupervision={dialogState.editingSupervision}
        deletingSupervision={dialogState.deletingSupervision}
        setDeletingSupervision={dialogState.setDeletingSupervision}
        handleSuccess={dialogState.handleSuccess}
      />
    </div>
  );
}
