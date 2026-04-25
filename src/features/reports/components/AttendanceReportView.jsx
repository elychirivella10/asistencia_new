"use client";

import { AttendanceReportToolbar } from "./AttendanceReportToolbar";
import { useAttendanceReport } from "../hooks/useAttendanceReport";
import { getAttendanceReportColumns } from "../config/attendance-report-table.config";
import { REPORT_CONFIG } from "../config/report.constants";
import { TablePagination } from "@/components/shared/TablePagination";
import { DataTable } from "@/components/shared/DataTable";

/**
 * Orchestrates the Attendance Report view.
 * Renders only a paginatedData slice for performance;
 * exports still use the full allData set.
 */
export function AttendanceReportView({ areas, statusMap }) {
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
  } = useAttendanceReport();

  const columns = getAttendanceReportColumns(statusMap);

  return (
    <div className="space-y-4">
      <AttendanceReportToolbar
        onFilter={fetchReport}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isPending={isPending}
        hasData={hasData}
        areas={areas}
        statusMap={statusMap}
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
              columns={columns}
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
            entityName="registros"
          />
        </>
      )}
    </div>
  );
}
