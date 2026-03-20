"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupervisionTable } from "../hooks/useSupervisionTable";
import { useSupervisionTableDialogs } from "../hooks/useSupervisionTableDialogs";
import { getSupervisionTableColumns } from "../config/supervision-table.config";
import { SupervisionTableView } from "./SupervisionTableView";
import { usePermission } from "@/features/auth/components/permissions-provider";

export function SupervisionTable({ data }) {
  const tableState = useSupervisionTable(data);
  const dialogState = useSupervisionTableDialogs();
  const { can } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { handleEdit, handleDelete } = dialogState;

  const columns = useMemo(
    () => getSupervisionTableColumns(handleEdit, handleDelete, can),
    [handleEdit, handleDelete, can]
  );

  const handleSortChange = (key, direction) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("sortKey", key); else params.delete("sortKey");
    if (direction) params.set("sortDirection", direction); else params.delete("sortDirection");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <SupervisionTableView
      tableState={tableState}
      dialogState={dialogState}
      columns={columns}
      data={data}
      onSortChange={handleSortChange}
    />
  );
}
