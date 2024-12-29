/*
  # Fix contact status column names and types
  
  1. Changes
    - Ensure contact_status_history table uses correct column name
    - Update trigger function to use correct column names
    - Add proper type casting for contact_status enum
*/

-- First check if we need to rename the column
DO $$ 
BEGIN
  -- Only attempt rename if 'status' column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'contact_status_history' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE contact_status_history 
    RENAME COLUMN status TO contact_status;
  END IF;
END $$;

-- Ensure contact_status column exists with correct type
DO $$ 
BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'contact_status_history' 
    AND column_name = 'contact_status'
  ) THEN
    ALTER TABLE contact_status_history 
    ADD COLUMN contact_status contact_status NOT NULL;
  END IF;
END $$;

-- Update the trigger function to use correct column name
CREATE OR REPLACE FUNCTION track_contact_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.contact_status IS DISTINCT FROM NEW.contact_status)
  OR (TG_OP = 'INSERT') THEN
    INSERT INTO contact_status_history (
      campaign_contact_id,
      contact_status,
      changed_by
    ) VALUES (
      NEW.campaign_user_id,
      NEW.contact_status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;