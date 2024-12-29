/*
  # Add contact status tracking
  
  1. Changes
    - Add contact_status column to campaign_contacts table
    - Create contact status history table
    - Add automatic tracking via triggers
  
  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Drop existing enum if needed and recreate
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'contact_status'
  ) THEN
    CREATE TYPE contact_status AS ENUM (
      'Awaiting Contact',
      'Queued',
      'In Progress',
      'Contacted',
      'Awaiting Callback (Reattempt)',
      'Awaiting Callback (Scheduled)',
      'Action Required',
      'Awaiting Confirmation',
      'Completed',
      'Failed',
      'Do Not Contact'
    );
  END IF;
END $$;

-- Add status column to campaign_contacts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaign_contacts' 
    AND column_name = 'contact_status'
  ) THEN
    ALTER TABLE campaign_contacts 
    ADD COLUMN contact_status contact_status NOT NULL DEFAULT 'Awaiting Contact';
  END IF;
END $$;

-- Create contact status history table
CREATE TABLE IF NOT EXISTS contact_status_history (
  history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id uuid NOT NULL REFERENCES campaign_contacts(campaign_user_id) ON DELETE CASCADE,
  status contact_status NOT NULL,
  notes text,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view status history for their campaign contacts"
  ON contact_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = contact_status_history.campaign_contact_id
      AND c.owner = auth.uid()
    )
  );

CREATE POLICY "Users can insert status history for their campaign contacts"
  ON contact_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = campaign_contact_id
      AND c.owner = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_status_history_campaign_contact 
  ON contact_status_history(campaign_contact_id);
CREATE INDEX IF NOT EXISTS idx_status_history_status 
  ON contact_status_history(status);
CREATE INDEX IF NOT EXISTS idx_status_history_created 
  ON contact_status_history(created_at);

-- Create function to automatically track status changes
CREATE OR REPLACE FUNCTION track_contact_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.contact_status IS DISTINCT FROM NEW.contact_status)
  OR (TG_OP = 'INSERT') THEN
    INSERT INTO contact_status_history (
      campaign_contact_id,
      status,
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

-- Create trigger for status changes
DROP TRIGGER IF EXISTS contact_status_change_trigger ON campaign_contacts;
CREATE TRIGGER contact_status_change_trigger
  AFTER INSERT OR UPDATE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION track_contact_status_change();