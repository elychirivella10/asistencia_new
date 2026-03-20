"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Paginación genérica para tablas.
 * @param {Object} props
 * @param {number} props.currentPage - Página actual (1-based).
 * @param {number} props.totalPages - Total de páginas.
 * @param {Function} props.onPageChange - Callback al cambiar página.
 * @param {number} props.currentCount - Cantidad de items mostrados actualmente.
 * @param {number} props.totalCount - Cantidad total de items filtrados.
 * @param {string} [props.entityName="registros"] - Nombre de la entidad (plural) para el texto.
 */
export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  currentCount,
  totalCount,
  entityName = "registros",
}) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {currentCount} de {totalCount} {entityName}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
