"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoleTable } from "../hooks/useRoleTable";
import { useRoleTableDialogs } from "../hooks/useRoleTableDialogs";
import { getRoleTableColumns } from "../config/role-table.config";
import { usePermission } from "@/providers/permissions-provider";
import { RoleTableView } from "./RoleTableView";

export function RoleTable({ data, permissions }) {
  const { can } = usePermission();
  const tableState = useRoleTable(data);
  const dialogState = useRoleTableDialogs();
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns = useMemo(
    () => getRoleTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [dialogState.handleEdit, dialogState.handleDelete, can]
  );

  const handleSortChange = (key, direction) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("sortKey", key); else params.delete("sortKey");
    if (direction) params.set("sortDirection", direction); else params.delete("sortDirection");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <RoleTableView
      tableState={tableState}
      dialogState={dialogState}
      columns={columns}
      data={{ permissions }}
      onSortChange={handleSortChange}
    />
  );
}
