/*
  # Add personalization fields to campaign_contacts

  1. Changes
    - Add personalization_fields column to campaign_contacts table
    - Add index for better query performance on the JSONB column
*/

-- Add personalization_fields column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'campaign_contacts' 
    AND column_name = 'personalization_fields'
  ) THEN
    ALTER TABLE campaign_contacts 
    ADD COLUMN personalization_fields jsonb;
  END IF;
END $$;

-- Create index for JSONB queries if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'campaign_contacts'
    AND indexname = 'idx_campaign_contacts_personalization'
  ) THEN
    CREATE INDEX idx_campaign_contacts_personalization 
    ON campaign_contacts USING gin (personalization_fields);
  END IF;
END $$;