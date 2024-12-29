import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  error?: string;
}

export function validateAndFormatPhone(phone: string, defaultCountry: CountryCode = 'US'): PhoneValidationResult {
  try {
    // Clean the phone number by removing non-digit characters except +
    const cleanedPhone = phone.trim().replace(/[^+\d]/g, '');

    // Add default country code if the number doesn't start with +
    const phoneWithPrefix = cleanedPhone.startsWith('+')
      ? cleanedPhone
      : `+${defaultCountry === 'US' ? '1' : ''}${cleanedPhone}`;

    // Parse the phone number
    const phoneNumber = parsePhoneNumberFromString(phoneWithPrefix, defaultCountry);

    // Check if the parsed phone number is valid
    if (!phoneNumber || !phoneNumber.isValid()) {
      return {
        isValid: false,
        error: `Invalid phone number format: ${phone}`
      };
    }

    // Return the number in E.164 format
    return {
      isValid: true,
      formattedNumber: phoneNumber.format('E.164')
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid phone number format: ${phone}`
    };
  }
}

export function formatPhoneNumber(phone: string, defaultCountry: CountryCode = 'US'): string {
  const result = validateAndFormatPhone(phone, defaultCountry);
  if (!result.isValid || !result.formattedNumber) {
    throw new Error(result.error || 'Invalid phone number');
  }
  return result.formattedNumber;
}