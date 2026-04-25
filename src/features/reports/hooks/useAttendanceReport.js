"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { getAttendanceReportAction } from "../actions/attendance-report-read.action";
import { exportToExcel } from "../lib/exportToExcel";
import { exportToPDF } from "../lib/exportToPDF";
import { attendancePdfColumns, getAttendanceExportData } from "../config/attendance-report-table.config";
import { REPORT_CONFIG } from "../config/report.constants";

const PAGE_SIZE = REPORT_CONFIG.PAGINATION.PAGE_SIZE;

/**
 * Manages data fetching, pagination, export and loading for the Attendance report.
 * Fetches ALL data (needed for export) but displays paginated slices for performance.
 */
export function useAttendanceReport() {
  const [displayData, setDisplayData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "fecha", direction: "desc" });
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchReport = (filters, page = 1, sort = sortConfig) => {
    setCurrentPage(page);
    setCurrentFilters(filters);
    setSortConfig(sort);

    startTransition(async () => {
      const res = await getAttendanceReportAction({
        ...filters,
        page,
        pageSize: PAGE_SIZE,
        sortKey: sort.key,
        sortDirection: sort.direction,
      });

      if (res?.success) {
        setDisplayData(res.data);
        setTotalCount(res.totalCount);
        if (!res.data.length && page === 1) toast.info("No se hallaron registros en ese periodo.");
      } else {
        toast.error(res?.error ?? "Error al generar el reporte.");
      }
    });
  };

  const handleSort = (key) => {
    const nextDir = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    fetchReport(currentFilters, 1, { key, direction: nextDir });
  };

  const handleExportExcel = async () => {
    if (!currentFilters) return;
    
    startTransition(async () => {
      toast.loading("Generando Excel...", { id: "export-excel" });
      const res = await getAttendanceReportAction({
        ...currentFilters,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });
      
      if (res?.success) {
        const dataToExport = getAttendanceExportData(res.data);
        exportToExcel(dataToExport, "Reporte_Asistencia", "Consolidado");
        toast.success("Excel generado correctamente.", { id: "export-excel" });
      } else {
        toast.error("Error al obtener datos para exportar.", { id: "export-excel" });
      }
    });
  };

  const handleExportPDF = async () => {
    if (!currentFilters) return;

    startTransition(async () => {
      toast.loading("Generando PDF...", { id: "export-pdf" });
      const res = await getAttendanceReportAction({
        ...currentFilters,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });

      if (res?.success) {
        const dataToExport = getAttendanceExportData(res.data);
        await exportToPDF(
          dataToExport,
          attendancePdfColumns,
          "Reporte_Asistencia",
          "Reporte Consolidado de Asistencia"
        );
        toast.success("PDF generado correctamente.", { id: "export-pdf" });
      } else {
        toast.error("Error al obtener datos para exportar.", { id: "export-pdf" });
      }
    });
  };

  return {
    paginatedData: displayData,
    isPending,
    hasData: totalCount > 0,
    currentPage,
    totalPages,
    totalCount,
    sortConfig,
    onPageChange: (page) => fetchReport(currentFilters, page, sortConfig),
    onSort: handleSort,
    fetchReport,
    handleExportExcel,
    handleExportPDF,
  };
}
