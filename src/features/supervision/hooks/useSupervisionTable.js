import { useState, useCallback } from "react";
import { useDataTable } from "@/features/shared/hooks/useDataTable";

export function useSupervisionTable(initialData) {
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Definición de Filtros
  const filterFunction = useCallback((item) => {
    const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;

    const supervisorName = `${item.usuarios?.nombre} ${item.usuarios?.apellido}`.toLowerCase();
    const areaName = item.areas?.nombre?.toLowerCase() || "";
    
    // Each word must match either the supervisor or the area
    return words.every(word => 
      supervisorName.includes(word) || areaName.includes(word)
    );
  }, [searchTerm]);

  const getValue = useCallback((item, key) => {
    switch (key) {
      case 'usuario_id': return `${item.usuarios?.nombre} ${item.usuarios?.apellido}`;
      case 'area_id': return item.areas?.nombre;
      default: return item[key];
    }
  }, []);

  // Uso del Hook Genérico
  const {
    paginatedData: paginatedSupervisions,
    processedData: filteredSupervisions,
    currentPage,
    totalPages,
    setCurrentPage,
    sortConfig,
    handleSort,
    isPending,
    startTransition
  } = useDataTable(initialData, {
    itemsPerPage: 10,
    getValue,
    filterFunction
  });

  // Manejadores
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    });
  };

  return {
    // Data
    filteredSupervisions,
    paginatedSupervisions,
    totalPages,
    currentPage,
    isPending,

    // UI State
    searchTerm,

    // Handlers
    handleSearchChange,
    setCurrentPage,
    sortConfig,
    handleSort
  };
}
