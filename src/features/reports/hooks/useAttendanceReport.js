"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { getAttendanceReportAction } from "../actions/report-read.action";
import { exportToExcel } from "../utils/exportToExcel";
import { exportToPDF } from "../utils/exportToPDF";
import { attendancePdfColumns, getAttendanceExportData } from "../config/attendance-report.config";
import { REPORT_CONFIG } from "../config/report.constants";

const PAGE_SIZE = REPORT_CONFIG.PAGINATION.PAGE_SIZE;

/**
 * Manages data fetching, pagination, export and loading for the Attendance report.
 * Fetches ALL data (needed for export) but displays paginated slices for performance.
 */
export function useAttendanceReport() {
  const [allData, setAllData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Paginated slice for display
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allData.slice(start, start + PAGE_SIZE);
  }, [allData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));

  const fetchReport = (filters) => {
    setCurrentPage(1); // Reset to first page on new fetch
    startTransition(async () => {
      const res = await getAttendanceReportAction(filters);

      if (res?.success) {
        setAllData(res.data);
        if (!res.data.length) toast.info("No se hallaron registros en ese periodo.");
        else toast.success(`${res.data.length} registros encontrados.`);
      } else {
        toast.error(res?.error ?? "Error al generar el reporte.");
      }
    });
  };

  const handleExportExcel = () => {
    const dataToExport = getAttendanceExportData(allData);
    exportToExcel(dataToExport, "Reporte_Asistencia", "Consolidado");
  };

  const handleExportPDF = async () => {
    const dataToExport = getAttendanceExportData(allData);
    await exportToPDF(
      dataToExport,
      attendancePdfColumns,
      "Reporte_Asistencia",
      "Reporte Consolidado de Asistencia"
    );
  };

  return {
    paginatedData,
    allData,
    isPending,
    hasData: allData.length > 0,
    currentPage,
    totalPages,
    totalCount: allData.length,
    onPageChange: setCurrentPage,
    fetchReport,
    handleExportExcel,
    handleExportPDF,
  };
}
