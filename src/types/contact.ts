export interface ContactDetails {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string;
  email: string | null;
  phone_number: string;
  city: string | null;
  state: string | null;
  preferred_language: string;
  do_not_contact: boolean;
  sms_contact_window: string[];
  call_contact_window: string[];
  time_zone: string;
  created_at: string;
  updated_at: string;
}