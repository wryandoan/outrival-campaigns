/*
  # Fix campaign contacts status handling
  
  1. Changes
    - Safely convert contact_status column to use proper enum type
    - Update constraints for action items and channels
*/

-- First remove the default constraint
ALTER TABLE campaign_contacts 
ALTER COLUMN contact_status DROP DEFAULT;

-- Convert the column to text temporarily
ALTER TABLE campaign_contacts 
ALTER COLUMN contact_status TYPE text;

-- Update existing values to match enum format
UPDATE campaign_contacts
SET contact_status = CASE contact_status
    WHEN 'Awaiting Contact' THEN 'awaiting_contact'
    WHEN 'Queued' THEN 'queued'
    WHEN 'In Progress' THEN 'in_progress'
    WHEN 'Contacted' THEN 'contacted'
    WHEN 'Awaiting Callback (Reattempt)' THEN 'awaiting_callback_reattempt'
    WHEN 'Awaiting Callback (Scheduled)' THEN 'awaiting_callback_scheduled'
    WHEN 'Action Required' THEN 'action_required'
    WHEN 'Awaiting Confirmation' THEN 'awaiting_confirmation'
    WHEN 'Completed' THEN 'completed'
    WHEN 'Failed' THEN 'failed'
    WHEN 'Do Not Contact' THEN 'do_not_contact'
    ELSE 'awaiting_contact'
END;

-- Convert to enum type
ALTER TABLE campaign_contacts 
ALTER COLUMN contact_status TYPE contact_status USING contact_status::contact_status;

-- Add back the default
ALTER TABLE campaign_contacts 
ALTER COLUMN contact_status SET DEFAULT 'awaiting_contact'::contact_status;

-- Update follow_up_action_item constraints
ALTER TABLE campaign_contacts
DROP CONSTRAINT IF EXISTS campaign_contacts_follow_up_action_item_check;

ALTER TABLE campaign_contacts
ADD CONSTRAINT campaign_contacts_follow_up_action_item_check
CHECK (
  follow_up_action_item IS NULL OR 
  follow_up_action_item IN ('call_back', 'send_text', 'none')
);

-- Update last_responded_channel constraints
ALTER TABLE campaign_contacts
DROP CONSTRAINT IF EXISTS campaign_contacts_last_responded_channel_check;

ALTER TABLE campaign_contacts
ADD CONSTRAINT campaign_contacts_last_responded_channel_check
CHECK (
  last_responded_channel IS NULL OR 
  last_responded_channel IN ('call', 'sms', 'email')
);