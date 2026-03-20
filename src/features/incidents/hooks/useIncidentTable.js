import { useState, useCallback } from "react";
import { useDataTable } from "@/features/shared/hooks/useDataTable";

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function useIncidentTable(data) {
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Definición de Filtros
  const filterFunction = useCallback((item) => {
    const matchesSearch = 
      item.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario?.cedula?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  }, [searchTerm, statusFilter]);

  const getValue = useCallback((item, key) => {
    return getNestedValue(item, key);
  }, []);

  const {
    paginatedData,
    sortConfig,
    handleSort,
    totalPages,
    currentPage,
    setCurrentPage,
    totalItems,
    startTransition,
    isPending,
    processedData
  } = useDataTable(data, {
    itemsPerPage: 10,
    getValue,
    filterFunction,
  });

  // Wrappers para filtros con transition
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    });
  };

  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value);
      setCurrentPage(1);
    });
  };

  return {
    paginatedData,
    sortConfig,
    handleSort,
    totalPages,
    currentPage,
    setCurrentPage,
    totalItems,
    isPending,
    filteredData: processedData, // Expose processedData as filteredData
    
    searchTerm,
    statusFilter,
    handleSearchChange,
    handleStatusChange,
  };
}
