"use client";

import { useMemo } from "react";
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

  const columns = useMemo(
    () => getAttendanceTableColumns(statusMap, dialogState.handleDetails),
    [statusMap, dialogState.handleDetails]
  );

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <AttendanceToolbar areas={areas} statusMap={statusMap} />

      <AttendanceStats stats={stats} />
      
      <div className="rounded-md border">
        <DataTable 
          data={data || []} 
          columns={columns} 
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
