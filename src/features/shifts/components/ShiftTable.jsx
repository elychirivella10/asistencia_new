"use client";

import { useMemo } from "react";
import { getShiftTableColumns } from "../config/shift-table.config";
import { useShiftTable } from "../hooks/useShiftTable";
import { useShiftTableDialogs } from "../hooks/useShiftTableDialogs";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { ShiftTableView } from "./ShiftTableView";

export function ShiftTable({ data }) {
  const { can } = usePermission();
  const tableState = useShiftTable(data);
  const dialogState = useShiftTableDialogs();

  const columns = useMemo(
    () => getShiftTableColumns(dialogState.handleEdit, dialogState.setDeletingShift, can),
    [dialogState.handleEdit, dialogState.setDeletingShift, can]
  );

  return (
    <ShiftTableView
      tableState={tableState}
      dialogState={dialogState}
      columns={columns}
    />
  );
}
