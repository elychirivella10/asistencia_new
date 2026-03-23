"use client";

import { NovedadesToolbar } from "./NovedadesToolbar";
import { useNovedadesReport } from "../hooks/useNovedadesReport";
import { novedadesReportColumns } from "../config/novedades-report.config";
import { REPORT_CONFIG } from "../config/report.constants";
import { TablePagination } from "@/components/shared/TablePagination";

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
    onPageChange,
  } = useNovedadesReport();

  return (
    <div className="space-y-4">
      <NovedadesToolbar
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
          <div className={`rounded-md border overflow-auto transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 sticky top-0 text-xs uppercase text-muted-foreground">
                <tr>
                  {novedadesReportColumns.map((col) => (
                    <th key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    {novedadesReportColumns.map((col) => (
                      <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
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
            entityName="novedades"
          />
        </>
      )}
    </div>
  );
}
