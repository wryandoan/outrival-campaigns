import type { Database } from '../../lib/supabase/types';
import { API_BASE_URL } from '../api';

type PhoneNumbers = Database['public']['Tables']['campaigns']['Row']['phone_numbers'];

interface PhoneNumberRequest {
  region: string;
  city: string;
  count: number;
}

interface PhoneNumberResponse {
  phone_numbers: PhoneNumbers;
}

export async function generatePhoneNumbers(request: PhoneNumberRequest = {
  region: "FL",
  city: "Miami",
  count: 3
}): Promise<PhoneNumbers> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/phone-numbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch phone numbers: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data: PhoneNumberResponse = await response.json();
    return data.phone_numbers;
  } catch (error) {
    console.error('Error generating phone numbers:', error);
    throw error;
  }
}