import type { CSVParseResult } from '../../types/import';

function parseText(text: string): CSVParseResult {
  try {
    // Try parsing as JSON (XLSX format) first
    const data = JSON.parse(text);
    
    if (Array.isArray(data) && data.length >= 2) {
      // Handle XLSX format
      const headers = Object.keys(data[0]);
      const rows = data.slice(1).map((row, index) => ({
        values: headers.map(header => String(row[header] || '').trim()),
        rowNumber: index + 2
      }));
      return { headers, rows };
    }
  } catch {
    // Not JSON/XLSX, try CSV format
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('File must contain a header row and at least one contact');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map((line, index) => ({
      values: line.split(',').map(v => v.trim()),
      rowNumber: index + 2
    }));

    return { headers, rows };
  }

  throw new Error('Invalid file format. Must be CSV or Excel format');
}

export function parseCSV(text: string): CSVParseResult {
  return parseText(text);
}