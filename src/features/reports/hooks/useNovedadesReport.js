"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { getNovedadesReportAction } from "../actions/novedades-report-read.action";
import { exportToExcel } from "../lib/exportToExcel";
import { exportToPDF } from "../lib/exportToPDF";
import { novedadesPdfColumns, getNovedadesExportData } from "../config/novedades-report-table.config";
import { REPORT_CONFIG } from "../config/report.constants";

const PAGE_SIZE = REPORT_CONFIG.PAGINATION.PAGE_SIZE;

export function useNovedadesReport() {
  const [displayData, setDisplayData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "fecha_inicio", direction: "desc" });
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchReport = (filters, page = 1, sort = sortConfig) => {
    setCurrentPage(page);
    setCurrentFilters(filters);
    setSortConfig(sort);

    startTransition(async () => {
      const res = await getNovedadesReportAction({
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
      toast.loading("Generando Excel...", { id: "export-excel-novedades" });
      const res = await getNovedadesReportAction({
        ...currentFilters,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });

      if (res?.success) {
        const dataToExport = getNovedadesExportData(res.data);
        exportToExcel(dataToExport, "Reporte_Novedades", "Novedades");
        toast.success("Excel generado correctamente.", { id: "export-excel-novedades" });
      } else {
        toast.error("Error al obtener datos para exportar.", { id: "export-excel-novedades" });
      }
    });
  };

  const handleExportPDF = async () => {
    if (!currentFilters) return;

    startTransition(async () => {
      toast.loading("Generando PDF...", { id: "export-pdf-novedades" });
      const res = await getNovedadesReportAction({
        ...currentFilters,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });

      if (res?.success) {
        const dataToExport = getNovedadesExportData(res.data);
        await exportToPDF(
          dataToExport,
          novedadesPdfColumns,
          "Reporte_Novedades",
          "Historial de Permisos y Novedades"
        );
        toast.success("PDF generado correctamente.", { id: "export-pdf-novedades" });
      } else {
        toast.error("Error al obtener datos para exportar.", { id: "export-pdf-novedades" });
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
