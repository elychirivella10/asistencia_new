"use client";

import { useMemo, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from 'next/navigation';
import { AttendanceToolbar } from "./AttendanceToolbar";
import { AttendanceStats } from "./AttendanceStats";
import { DataTable } from "@/components/shared/DataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { getAttendanceTableColumns } from "../config/attendance-table.config";
import { useAttendanceTableDialogs } from "../hooks/useAttendanceTableDialogs";
import { AttendanceTableDialogs } from "./AttendanceTableDialogs";

export function AttendanceTableView({
  data,
  stats,
  areas,
  statusMap,
  pagination
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogState = useAttendanceTableDialogs();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Solo notificar si se ha aplicado al menos un filtro (el string no está vacío)
    if (searchParams.toString() !== "") {
      const count = pagination?.totalCount || 0;
      if (count > 0) toast.success(`${count} registros encontrados.`);
      else toast.info("No se hallaron registros con estos filtros.");
    }
  }, [data]);

  const sortConfig = {
    key: searchParams.get("sortKey") || "",
    direction: searchParams.get("sortDirection") || "desc"
  };

  const handleSort = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    const isDesc = sortConfig.key === key && sortConfig.direction === "desc";
    const nextDir = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    if (isDesc) {
      params.delete("sortKey");
      params.delete("sortDirection");
    } else {
      params.set("sortKey", key);
      params.set("sortDirection", nextDir);
    }
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const columns = useMemo(
    () => getAttendanceTableColumns(statusMap, dialogState.handleDetails),
    [statusMap, dialogState.handleDetails]
  );

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-4">
      <AttendanceToolbar areas={areas} statusMap={statusMap} />

      <AttendanceStats stats={stats} />

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <DataTable
          data={data || []}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="No se encontraron registros de asistencia."
        />
      </div>

      <TablePagination
        currentPage={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        onPageChange={handlePageChange} // <-- CORRECCIÓN APLICADA
        currentCount={(data || []).length}
        totalCount={pagination?.totalCount || 0}
        entityName="registros"
      />

      <AttendanceTableDialogs {...dialogState} statusMap={statusMap} />
    </div>
  );
}
