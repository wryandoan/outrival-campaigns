/*
  # Fix contact status enum values

  Updates the contact status enum to use consistent casing and formatting.

  1. Changes
    - Drop and recreate contact_status enum with standardized values
    - Update existing data to match new enum values
    - Update stored procedure to use correct enum value
*/

-- Drop dependent objects first
DROP TRIGGER IF EXISTS contact_status_change_trigger ON campaign_contacts;
DROP FUNCTION IF EXISTS track_contact_status_change();
DROP FUNCTION IF EXISTS link_contacts_to_campaign();

-- Drop and recreate the enum with standardized values
DROP TYPE contact_status CASCADE;
CREATE TYPE contact_status AS ENUM (
  'awaiting_contact',
  'queued',
  'in_progress',
  'contacted',
  'awaiting_callback_reattempt',
  'awaiting_callback_scheduled',
  'action_required',
  'awaiting_confirmation',
  'completed',
  'failed',
  'do_not_contact'
);

-- Recreate the tracking function
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

-- Recreate the trigger
CREATE TRIGGER contact_status_change_trigger
  AFTER INSERT OR UPDATE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION track_contact_status_change();

-- Recreate the link contacts function with correct enum value
CREATE OR REPLACE FUNCTION link_contacts_to_campaign(
  p_campaign_id uuid,
  p_contact_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO campaign_contacts (
    campaign_id,
    contact_id,
    contact_status,
    assigned_date
  )
  SELECT 
    p_campaign_id,
    id,
    'awaiting_contact'::contact_status,
    now()
  FROM unnest(p_contact_ids) AS id;
END;
$$;