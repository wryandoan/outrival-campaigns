import type { Database } from '../../lib/supabase/types';

type PhoneNumbers = Database['public']['Tables']['campaigns']['Row']['phone_numbers'];

export const DEFAULT_PHONE_NUMBERS: PhoneNumbers = {
  "phone_numbers": {
    "primary": {
      "number": "+1234567890"
    },
    "secondary": [
      { "number": "+1987654321" },
      { "number": "+1123456789" },
      { "number": "+1098765432" }
    ],
    "cnam": ""
  }
};