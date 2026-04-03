"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { getNovedadesReportAction } from "../actions/novedades-read.action";
import { exportToExcel } from "../utils/exportToExcel";
import { exportToPDF } from "../utils/exportToPDF";
import { novedadesPdfColumns, getNovedadesExportData } from "../config/novedades-report.config";
import { REPORT_CONFIG } from "../config/report.constants";

const PAGE_SIZE = REPORT_CONFIG.PAGINATION.PAGE_SIZE;

export function useNovedadesReport() {
  const [allData, setAllData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allData.slice(start, start + PAGE_SIZE);
  }, [allData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));

  const fetchReport = (filters) => {
    setCurrentPage(1);
    startTransition(async () => {
      const res = await getNovedadesReportAction(filters);
      if (res?.success) {
        setAllData(res.data);
        if (!res.data.length) toast.info("No se hallaron registros en ese periodo.");
        else toast.success(`${res.data.length} novedades encontradas.`);
      } else {
        toast.error(res?.error ?? "Error al generar el reporte.");
      }
    });
  };

  const handleExportExcel = () => {
    const dataToExport = getNovedadesExportData(allData);
    exportToExcel(dataToExport, "Reporte_Novedades", "Novedades");
  };

  const handleExportPDF = async () => {
    const dataToExport = getNovedadesExportData(allData);
    await exportToPDF(
      dataToExport,
      novedadesPdfColumns,
      "Reporte_Novedades",
      "Historial de Permisos y Novedades"
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
