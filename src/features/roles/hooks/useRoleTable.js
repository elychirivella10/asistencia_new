import { useCallback, useState } from "react";
import { useDataTable } from "@/features/shared/hooks/useDataTable";
import { ROLE_CONFIG } from "../config/role.constants";

export function useRoleTable(roles = []) {
  const [filterText, setFilterText] = useState("");

  const filterFunction = useCallback((item) => {
    const searchLower = filterText.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(searchLower) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchLower))
    );
  }, [filterText]);

  const getValue = useCallback((item, key) => {
    if (key === "usuario_count") return item.usuario_count || 0;
    return item[key];
  }, []);

  const tableData = useDataTable(roles, {
    filterFunction,
    getValue,
    itemsPerPage: ROLE_CONFIG.UI.ITEMS_PER_PAGE,
  });

  return {
    ...tableData,
    filterText,
    setFilterText,
  };
}
