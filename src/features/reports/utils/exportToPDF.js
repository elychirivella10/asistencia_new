/**
 * Exports an array of plain objects to a PDF file using jsPDF.
 * Uses dynamic import so jsPDF (which uses fflate Web Workers) is never
 * bundled by Next.js on the server side.
 *
 * @param {Array<Object>} data - Data rows
 * @param {Array<{header: string, dataKey: string}>} columns - Column definitions
 * @param {string} filename - Filename without extension
 * @param {string} title - Document title shown at the top
 */
export async function exportToPDF(data, columns, filename, title = 'Reporte') {
  if (!data?.length) return;

  // Dynamic import: only loaded in the browser on user interaction
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.text(title, 14, 22);

  doc.setFontSize(10);
  const now = new Date();
  doc.text(
    `Generado el: ${now.toLocaleDateString()} a las ${now.toLocaleTimeString()}`,
    14,
    30
  );

  autoTable(doc, {
    startY: 35,
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => row[c.dataKey] ?? '—')),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${filename}.pdf`);
}
