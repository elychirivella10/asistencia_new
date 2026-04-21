import { useCallback, useState } from "react";
import { useDataTable } from "@/features/shared/hooks/useDataTable";
import { SHIFT_CONFIG } from "../config/shift.constants";

const EMPTY_ARRAY = [];

export function useShiftTable(shifts = EMPTY_ARRAY) {
  const [filterText, setFilterText] = useState("");

  const filterFunction = useCallback((item) => {
    const searchLower = filterText.toLowerCase();
    return item.nombre.toLowerCase().includes(searchLower);
  }, [filterText]);

  const getValue = useCallback((item, key) => {
    return item[key];
  }, []);

  const tableData = useDataTable(shifts, {
    filterFunction,
    getValue,
    itemsPerPage: SHIFT_CONFIG.UI?.ITEMS_PER_PAGE || 10,
  });

  return {
    ...tableData,
    filterText,
    setFilterText,
  };
}
