"use client";

import { ReportToolbar } from "./ReportToolbar";
import { useAttendanceReport } from "../hooks/useAttendanceReport";
import { getAttendanceReportColumns } from "../config/attendance-report.config";
import { REPORT_CONFIG } from "../config/report.constants";
import { TablePagination } from "@/components/shared/TablePagination";

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
    onPageChange,
  } = useAttendanceReport();

  const columns = getAttendanceReportColumns(statusMap);

  return (
    <div className="space-y-4">
      <ReportToolbar
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
          <div className={`rounded-md border overflow-auto transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 sticky top-0 text-xs uppercase text-muted-foreground">
                <tr>
                  {columns.map((col) => (
                    <th key={col.accessorKey} className={`px-4 py-3 ${col.className ?? ""}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    {columns.map((col) => (
                      <td key={col.accessorKey} className={`px-4 py-3 ${col.className ?? ""}`}>
                        {col.cell ? col.cell(row) : row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
