/*
  # Create interactions table for tracking all communication events
  
  1. New Table
    - interactions: Tracks all communication events (calls, SMS, etc.)
      - interaction_id (uuid, primary key)
      - campaign_contact_id (uuid, foreign key)
      - communication_type (text)
      - interaction_status (text)
      - interaction_disposition (text)
      - interaction_insight (text)
      - sent_date_time (timestamptz)
      - response_date_time (timestamptz)
      - response_channel (text)
      - content (text)
      - notes (text)
      - phone_number (text)
      - type (text)
  
  2. Security
    - Enable RLS
    - Add policies for campaign owners
*/

CREATE TABLE interactions (
  interaction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id uuid NOT NULL REFERENCES campaign_contacts(campaign_user_id) ON DELETE CASCADE,
  communication_type text NOT NULL CHECK (
    communication_type IN ('call', 'sms', 'email')
  ),
  interaction_status text NOT NULL CHECK (
    interaction_status IN ('Completed', 'Pending', 'Failed')
  ),
  interaction_disposition text CHECK (
    interaction_disposition IS NULL OR
    interaction_disposition IN (
      'call_attempted',
      'call_answered',
      'call_failed',
      'call_voicemail',
      'call_received',
      'sms_sent',
      'sms_failed',
      'sms_received'
    )
  ),
  interaction_insight text CHECK (
    interaction_insight IS NULL OR
    interaction_insight IN (
      'positive_response',
      'negative_response',
      'neutral_response',
      'voicemail_box_full',
      'network_error',
      'number_disconnected',
      'wrong_number',
      'do_not_call_requested',
      'callback_requested',
      'opted_out'
    )
  ),
  sent_date_time timestamptz NOT NULL,
  response_date_time timestamptz,
  response_channel text CHECK (
    response_channel IS NULL OR
    response_channel IN ('call', 'sms')
  ),
  content text,
  notes text,
  phone_number text NOT NULL CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$'),
  type text NOT NULL CHECK (type IN ('inbound', 'outbound')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view interactions for their campaigns"
  ON interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = interactions.campaign_contact_id
      AND c.owner = auth.uid()
    )
  );

CREATE POLICY "Users can manage interactions for their campaigns"
  ON interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = interactions.campaign_contact_id
      AND c.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = interactions.campaign_contact_id
      AND c.owner = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_interactions_campaign_contact ON interactions(campaign_contact_id);
CREATE INDEX idx_interactions_type ON interactions(type, communication_type);
CREATE INDEX idx_interactions_status ON interactions(interaction_status);
CREATE INDEX idx_interactions_dates ON interactions(sent_date_time, response_date_time);
CREATE INDEX idx_interactions_phone ON interactions(phone_number);

-- Add trigger for updated_at
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();