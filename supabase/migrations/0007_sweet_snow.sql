/*
  # Create campaign_contacts junction table
  
  1. New Table
    - campaign_contacts: Links campaigns with contacts and tracks their interaction status
      - campaign_user_id (uuid, primary key)
      - campaign_id (uuid, foreign key to campaigns)
      - contact_id (uuid, foreign key to contacts)
      - assigned_date (timestamptz)
      - next_follow_up_date_time (timestamptz)
      - follow_up_action_item (text)
      - last_responded_date (timestamptz)
      - last_responded_channel (text)
      - is_resolved (boolean)
      - resolved_date (timestamptz)
      - personalization_fields (jsonb)
  
  2. Security
    - Enable RLS
    - Add policies for campaign owners
*/

CREATE TABLE campaign_contacts (
  campaign_user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_date timestamptz NOT NULL DEFAULT now(),
  next_follow_up_date_time timestamptz,
  follow_up_action_item text CHECK (
    follow_up_action_item IS NULL OR 
    follow_up_action_item IN ('call_back', 'send_text', 'none')
  ),
  last_responded_date timestamptz,
  last_responded_channel text CHECK (
    last_responded_channel IS NULL OR 
    last_responded_channel IN ('call', 'sms', 'email')
  ),
  is_resolved boolean DEFAULT false,
  resolved_date timestamptz,
  personalization_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique campaign-contact pairs
  UNIQUE(campaign_id, contact_id)
);

-- Enable RLS
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view campaign contacts they own"
  ON campaign_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_contacts.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

CREATE POLICY "Users can manage campaign contacts they own"
  ON campaign_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_contacts.campaign_id
      AND campaigns.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_contacts.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_contact ON campaign_contacts(contact_id);
CREATE INDEX idx_campaign_contacts_follow_up ON campaign_contacts(next_follow_up_date_time)
  WHERE next_follow_up_date_time IS NOT NULL;
CREATE INDEX idx_campaign_contacts_resolved ON campaign_contacts(is_resolved, resolved_date)
  WHERE is_resolved = true;

-- Add trigger for updated_at
CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();