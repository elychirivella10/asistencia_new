import { useState, useCallback } from "react";
import { useDataTable } from "@/hooks/useDataTable";

export function useAreaTable(initialAreas) {
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Definición de Filtros y Ordenamiento
  const filterFunction = useCallback((area) => {
    const matchesSearch =
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || area.cat_tipos_area?.id === typeFilter;
    
    return matchesSearch && matchesType;
  }, [searchTerm, typeFilter]);

  const getValue = useCallback((item, key) => {
    switch (key) {
      case 'tipo': return item.cat_tipos_area?.nombre || '';
      case 'parent': return item.parent?.nombre || '';
      case 'jefe': return item.jefe?.nombre || '';
      default: return item[key];
    }
  }, []);

  // Uso del Hook Genérico
  const {
    paginatedData: paginatedAreas,
    processedData: filteredAreas,
    currentPage,
    totalPages,
    setCurrentPage,
    sortConfig,
    handleSort,
    isPending,
    startTransition
  } = useDataTable(initialAreas, {
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

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  return {
    // Data
    filteredAreas,
    paginatedAreas,
    totalPages,
    currentPage,
    isPending,

    // UI State
    searchTerm,
    typeFilter,

    // Handlers
    handleSearchChange,
    handleTypeChange,
    setCurrentPage,
    sortConfig,
    handleSort
  };
}
