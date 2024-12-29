/*
  # Fix users table structure
  
  1. Changes
    - Drop existing users table and related objects
    - Create new contacts table for uploaded contact lists
    - Remove auth user triggers
  
  2. Security
    - Enable RLS on contacts table
    - Add policies for contact management
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_auth_user_change();

-- Drop existing users table
DROP TABLE IF EXISTS users CASCADE;

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text NOT NULL,
  email text,
  phone_number text NOT NULL,
  city text,
  state text,
  preferred_language text NOT NULL DEFAULT 'en-us',
  do_not_contact boolean NOT NULL DEFAULT false,
  sms_contact_window text[] NOT NULL DEFAULT ARRAY['09:00-17:00'],
  call_contact_window text[] NOT NULL DEFAULT ARRAY['09:00-17:00'],
  time_zone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_phone_check CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$')
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Add trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();