import type { FieldMapping, PersonalizationField } from '../../types/import';
import { validateAndFormatPhone } from '../phone/formatter';

interface ValidationError {
  field: string;
  message: string;
}

export function validateContact(
  values: string[],
  headers: string[],
  mapping: FieldMapping,
  rowNumber: number
) {
  const errors: ValidationError[] = [];
  
  // Get field indices
  const firstNameIndex = headers.indexOf(mapping.firstName!);
  const lastNameIndex = headers.indexOf(mapping.lastName!);
  const phoneIndex = headers.indexOf(mapping.phoneNumber!);

  // Check if we have enough values
  if (values.length <= Math.max(firstNameIndex, lastNameIndex, phoneIndex)) {
    throw new Error('Row is missing required columns');
  }

  const firstName = values[firstNameIndex].trim();
  const lastName = values[lastNameIndex].trim();
  const rawPhone = values[phoneIndex].trim();

  // Validate name fields
  if (!firstName) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!lastName) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  // Validate phone
  const phoneResult = validateAndFormatPhone(rawPhone);
  if (!phoneResult.isValid) {
    errors.push({ field: 'phone', message: phoneResult.error || 'Invalid phone number' });
  }

  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }

  // Process personalization fields
  const personalization_fields: Record<string, string> = {};
  if (mapping.personalization) {
    for (const field of mapping.personalization) {
      if (field.key && field.csvHeader) {
        const fieldIndex = headers.indexOf(field.csvHeader);
        if (fieldIndex >= 0 && fieldIndex < values.length) {
          personalization_fields[field.key] = values[fieldIndex].trim();
        }
      }
    }
  }

  return {
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneResult.formattedNumber!,
    personalization_fields: Object.keys(personalization_fields).length > 0 ? personalization_fields : undefined
  };
}