export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number;
}

/**
 * Exports an array of objects to a CSV file and triggers a download.
 */
export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  const header = columns.map((c) => escapeCsvField(c.header)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvField(String(c.accessor(row)))).join(','),
    )
    .join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
