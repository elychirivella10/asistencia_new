"use client";

import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { RoleToolbar } from "./RoleToolbar";
import { RoleTableDialogs } from "./RoleTableDialogs";

export function RoleTableView({
  tableState,
  dialogState,
  columns,
  data: { permissions },
  onSortChange
}) {
  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    filterText,
    setFilterText,
    processedData
  } = tableState;

  const {
    open,
    onOpenChange,
    editingRole,
    deletingRole,
    setDeletingRole,
    handleCreate,
    handleSuccess
  } = dialogState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    handleSort(key);
    if (onSortChange) onSortChange(key, nextDir);
  };

  return (
    <div className="space-y-4">
      <RoleToolbar
        searchTerm={filterText}
        onSearchChange={setFilterText}
        onCreate={handleCreate}
      />

      <div className="rounded-md border">
        <DataTable
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleServerSort}
          emptyMessage={filterText ? "No se encontraron roles." : "No hay roles registrados."}
        />
      </div>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentCount={paginatedData.length}
        totalCount={processedData.length}
        entityName="roles"
      />

      <RoleTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingRole={editingRole}
        deletingRole={deletingRole}
        setDeletingRole={setDeletingRole}
        permissions={permissions}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
