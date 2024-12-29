import { validateContact } from '../../utils/csv/validation';
import type { ImportResult, FieldMapping, CSVParseResult } from '../../types/import';

export function processCSVImport(csvData: CSVParseResult, mapping: FieldMapping): ImportResult {
  const validContacts = [];
  const errors = [];

  for (const row of csvData.rows) {
    try {
      const contact = validateContact(row.values, csvData.headers, mapping, row.rowNumber);
      if (contact) {
        validContacts.push(contact);
      } else {
        errors.push({
          rowNumber: row.rowNumber,
          message: 'Invalid contact data',
          data: {
            name: `${row.values[csvData.headers.indexOf(mapping.firstName || '')] || ''} ${
              row.values[csvData.headers.indexOf(mapping.lastName || '')] || ''
            }`.trim(),
            phone: row.values[csvData.headers.indexOf(mapping.phoneNumber || '')] || ''
          }
        });
      }
    } catch (error) {
      errors.push({
        rowNumber: row.rowNumber,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          name: `${row.values[csvData.headers.indexOf(mapping.firstName || '')] || ''} ${
            row.values[csvData.headers.indexOf(mapping.lastName || '')] || ''
          }`.trim(),
          phone: row.values[csvData.headers.indexOf(mapping.phoneNumber || '')] || ''
        }
      });
    }
  }

  return {
    contacts: validContacts,
    successful: 0, // Will be set during upload
    existing: 0, // Will be set during upload
    failed: errors.length,
    errors
  };
}