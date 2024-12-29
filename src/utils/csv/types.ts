export interface CSVRow {
  values: string[];
  rowNumber: number;
}

export interface CSVParseResult {
  headers: string[];
  rows: CSVRow[];
}

export interface ColumnIndices {
  nameIndex: number;
  phoneIndex: number;
}