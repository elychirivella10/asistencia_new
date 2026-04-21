"use client";

import { ShiftToolbar } from "./ShiftToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { ShiftTableDialogs } from "./ShiftTableDialogs";

export function ShiftTableView({
  tableState,
  dialogState,
  columns,
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
    processedData,
    isPending
  } = tableState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    handleSort(key);
    if (onSortChange) onSortChange(key, nextDir);
  };

  const {
    open,
    onOpenChange,
    editingShift,
    deletingShift,
    setDeletingShift,
    handleCreate,
    handleSuccess
  } = dialogState;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <ShiftToolbar
        searchTerm={filterText}
        onSearchChange={setFilterText}
        onCreate={handleCreate}
      />

      {/* Table */}
      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <DataTable
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleServerSort}
          emptyMessage={filterText ? "No se encontraron turnos con ese nombre." : "No hay turnos registrados."}
        />
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentCount={paginatedData.length}
        totalCount={processedData.length}
        entityName="turnos"
      />

      {/* Dialogs Combinados */}
      <ShiftTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingShift={editingShift}
        deletingShift={deletingShift}
        setDeletingShift={setDeletingShift}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
