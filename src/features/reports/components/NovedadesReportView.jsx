"use client";

import { NovedadesReportToolbar } from "./NovedadesReportToolbar";
import { useNovedadesReport } from "../hooks/useNovedadesReport";
import { novedadesReportColumns } from "../config/novedades-report-table.config";
import { REPORT_CONFIG } from "../config/report.constants";
import { TablePagination } from "@/components/shared/TablePagination";
import { DataTable } from "@/components/shared/DataTable";

export function NovedadesReportView({ areas, tiposPermiso }) {
  const {
    paginatedData,
    isPending,
    hasData,
    fetchReport,
    handleExportExcel,
    handleExportPDF,
    currentPage,
    totalPages,
    totalCount,
    sortConfig,
    onPageChange,
    onSort,
  } = useNovedadesReport();

  return (
    <div className="space-y-4">
      <NovedadesReportToolbar
        onFilter={fetchReport}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isPending={isPending}
        hasData={hasData}
        areas={areas}
        tiposPermiso={tiposPermiso}
      />

      {!hasData && !isPending && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {REPORT_CONFIG.UI.LABELS.NO_DATA}
        </p>
      )}

      {hasData && (
        <>
          <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <DataTable
              data={paginatedData}
              columns={novedadesReportColumns}
              sortConfig={sortConfig}
              onSort={onSort}
              emptyMessage={REPORT_CONFIG.UI.LABELS.NO_DATA}
            />
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            currentCount={paginatedData.length}
            totalCount={totalCount}
            entityName="novedades"
          />
        </>
      )}
    </div>
  );
}
