"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * Componente de tabla genérico y reutilizable.
 * 
 * @param {Object[]} data - Datos a mostrar.
 * @param {Object[]} columns - Configuración de columnas.
 *   - accessorKey: string (clave del dato)
 *   - header: string | ReactNode (título de la columna)
 *   - cell: function (render custom)
 *   - sortable: boolean (si es ordenable)
 *   - className: string (clase para el header)
 *   - cellClassName: string (clase para la celda)
 *   - width: string (ancho fijo, ej: "150px")
 * @param {Object} sortConfig - Configuración de ordenamiento actual { key, direction }.
 * @param {Function} onSort - Función para manejar el cambio de ordenamiento.
 * @param {Object} selection - Configuración de selección { selectedIds, onSelectRow, onSelectAll, isAllSelected, isIndeterminate }.
 * @param {string} emptyMessage - Mensaje para mostrar cuando no hay datos.
 */
export function DataTable({
  data,
  columns,
  sortConfig,
  onSort,
  selection,
  emptyMessage = "No hay resultados.",
}) {
  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey)
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Selection Checkbox Column */}
            {selection && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selection.isAllSelected}
                  onCheckedChange={selection.onSelectAll}
                  className={selection.isIndeterminate ? "opacity-50" : ""}
                  aria-label="Select all"
                />
              </TableHead>
            )}

            {/* Dynamic Columns */}
            {columns.map((col, index) => (
              <TableHead
                key={col.id || col.accessorKey || (typeof col.header === 'string' ? col.header : `col-${index}`)}
                style={{ 
                  width: col.width, 
                  minWidth: col.width,
                  maxWidth: col.width 
                }}
                className={
                  col.sortable
                    ? "cursor-pointer hover:bg-muted/50 transition-colors"
                    : ""
                }
                onClick={() => col.sortable && onSort && onSort(col.accessorKey)}
              >
                <div className={`flex items-center ${col.className || ""}`}>
                  {col.header}
                  {col.sortable && <SortIcon columnKey={col.accessorKey} />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selection ? 1 : 0)}
                className="h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                data-state={selection?.selectedIds?.has(row.id) && "selected"}
              >
                {/* Selection Checkbox Cell */}
                {selection && (
                  <TableCell>
                    <Checkbox
                      checked={selection.selectedIds.has(row.id)}
                      onCheckedChange={(checked) =>
                        selection.onSelectRow(row.id, checked)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                )}

                {/* Dynamic Cells */}
                {columns.map((col) => (
                  <TableCell 
                    key={`${row.id}-${col.accessorKey || col.header}`}
                    style={{ 
                      width: col.width, 
                      minWidth: col.width,
                      maxWidth: col.width
                    }}
                    className={col.cellClassName}
                  >
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
