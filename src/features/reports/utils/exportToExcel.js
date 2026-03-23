import * as XLSX from 'xlsx';

/**
 * Exports an array of plain objects to an Excel (.xlsx) file.
 * @param {Array<Object>} data - Data to export
 * @param {string} filename - Filename without extension
 * @param {string} sheetName - Worksheet name
 */
export function exportToExcel(data, filename, sheetName = 'Reporte') {
  if (!data?.length) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
