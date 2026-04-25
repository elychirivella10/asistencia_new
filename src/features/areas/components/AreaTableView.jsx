"use client";

import { useState } from "react";
import { AreaTableDialogs } from "./AreaTableDialogs";
import { TablePagination } from "@/components/shared/TablePagination";
import { DataTable } from "@/components/shared/DataTable";
import { AreaToolbar } from "./AreaToolbar";
import { AreaOrganigramView } from "./AreaOrganigramView";

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

  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <AreaToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        onReset={() => {
          handleSearchChange("");
          handleTypeChange("all");
        }}
        onCreate={handleCreate}
        tiposArea={tiposArea}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "table" ? (
        <>
          {/* Table */}
          <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
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
        </>
      ) : (
        <AreaOrganigramView dialogState={dialogState} />
      )}

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
