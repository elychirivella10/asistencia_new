"use client";

import { AreaTableDialogs } from "./AreaTableDialogs";
import { TablePagination } from "@/components/shared/TablePagination";
import { DataTable } from "@/components/shared/DataTable";
import { AreaToolbar } from "./AreaToolbar";

export function AreaTableView({
  tableState,
  dialogState,
  columns,
  data: { areas, tiposArea },
  onSortChange
}) {
  const {
    // Data
    filteredAreas,
    paginatedAreas,
    totalPages,
    currentPage,
    isPending,

    // UI State (Filters)
    searchTerm,
    typeFilter,

    // Sorting
    sortConfig,

    // Handlers (Filters)
    handleSearchChange,
    handleTypeChange,
    handleSort,
    setCurrentPage
  } = tableState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    handleSort(key);
    if (onSortChange) onSortChange(key, nextDir);
  };

  const {
    open,
    onOpenChange,
    editingArea,
    deletingArea,
    setDeletingArea,
    handleCreate,
    handleSuccess
  } = dialogState;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <AreaToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        onCreate={handleCreate}
        tiposArea={tiposArea}
      />

      {/* Table */}
      <div className={`rounded-md border transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        <DataTable
          data={paginatedAreas}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleServerSort}
          emptyMessage={searchTerm ? "No se encontraron áreas con ese criterio." : "No hay áreas registradas."}
        />
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentCount={paginatedAreas.length}
        totalCount={filteredAreas.length}
        entityName="áreas"
      />

      {/* Dialogs */}
      <AreaTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingArea={editingArea}
        deletingArea={deletingArea}
        setDeletingArea={setDeletingArea}
        areas={areas}
        tiposArea={tiposArea}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
