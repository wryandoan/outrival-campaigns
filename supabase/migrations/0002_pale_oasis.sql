/*
  # Create Users Table with Contact Preferences

  1. New Table
    - `users`
      - Core fields: id, names, contact info
      - Contact preferences: timezone, windows, do not contact flag
      - Timestamps for record management
  
  2. Security
    - Enable RLS
    - Add policies for user data access
    - Add necessary indexes
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text NOT NULL,
  email text,
  phone_number text,
  city text,
  state text,
  preferred_language text NOT NULL DEFAULT 'en-us',
  do_not_contact boolean NOT NULL DEFAULT false,
  sms_contact_window jsonb NOT NULL DEFAULT '["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=10,11,12,13,14,15,16,17;BYMINUTE=0"]',
  call_contact_window jsonb NOT NULL DEFAULT '["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=10,11,12,13,14,15,16,17;BYMINUTE=0"]',
  time_zone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();