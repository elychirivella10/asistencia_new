"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAreaTable } from "../hooks/useAreaTable";
import { useAreaTableDialogs } from "../hooks/useAreaTableDialogs";
import { getAreaTableColumns } from "../config/area-table.config";
import { usePermission } from "@/features/auth/components/permissions-provider";
import { AreaTableView } from "./AreaTableView";

export function AreaTable({ data, tiposArea }) {
  const { can } = usePermission();
  const tableState = useAreaTable(data);
  const dialogState = useAreaTableDialogs();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    handleEdit,
    handleAddSubArea,
    setDeletingArea,
  } = dialogState;

  const columns = useMemo(
    () => getAreaTableColumns(handleEdit, handleAddSubArea, setDeletingArea, can),
    [handleEdit, handleAddSubArea, setDeletingArea, can]
  );

  const handleSortChange = (key, direction) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("sortKey", key); else params.delete("sortKey");
    if (direction) params.set("sortDirection", direction); else params.delete("sortDirection");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <AreaTableView
      tableState={tableState}
      dialogState={dialogState}
      columns={columns}
      data={{ areas: data, tiposArea }}
      onSortChange={handleSortChange}
    />
  );
}
