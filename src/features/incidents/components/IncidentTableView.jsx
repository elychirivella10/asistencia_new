"use client";

import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { IncidentToolbar } from "./IncidentToolbar";
import { IncidentTableDialogs } from "./IncidentTableDialogs";

export function IncidentTableView({
  tableState,
  dialogState,
  columns,
  data: { incidentTypes },
  onSortChange
}) {
  const {
    paginatedData,
    sortConfig,
    handleSort,
    totalPages,
    currentPage,
    setCurrentPage,
    totalItems,
    searchTerm,
    handleSearchChange,
    statusFilter,
    handleStatusChange,
    isPending,
    filteredData
  } = tableState;

  const {
    open,
    onOpenChange,
    editingIncident,
    deletingIncident,
    setDeletingIncident,
    handleSuccess,
    handleCreate
  } = dialogState;

  const handleServerSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    handleSort(key);
    if (onSortChange) onSortChange(key, nextDir);
  };

  return (
    <div className="space-y-4">
      <IncidentToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onCreate={handleCreate}
      />

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <DataTable
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleServerSort}
          emptyMessage={searchTerm ? "No se encontraron novedades con ese criterio." : "No hay novedades registradas."}
        />
      </div>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentCount={paginatedData.length}
        totalCount={totalItems || filteredData?.length || 0}
        entityName="novedades"
      />

      <IncidentTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingIncident={editingIncident}
        incidentTypes={incidentTypes}
        deletingIncident={deletingIncident}
        setDeletingIncident={setDeletingIncident}
        handleSuccess={handleSuccess}
      />
    </div>
  );
}
