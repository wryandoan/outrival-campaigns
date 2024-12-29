/*
  # Update campaigns table schema
  
  1. Changes
    - Drop existing campaigns table
    - Create new campaigns table with updated schema
    - Add RLS policies and indexes
  
  2. New Schema
    - campaignID (uuid, primary key)
    - name (text, not null)
    - status (text, enum)
    - startDate (date, not null)
    - endDate (date)
    - phoneNumbers (jsonb)
    - owner (uuid, references auth.users)
    - createdAt/updatedAt timestamps
*/

-- Drop existing campaigns table
DROP TABLE IF EXISTS campaigns CASCADE;

-- Create new campaigns table
CREATE TABLE campaigns (
  campaign_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('Active', 'Completed')),
  start_date date NOT NULL,
  end_date date,
  phone_numbers jsonb,
  owner uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

-- Create indexes
CREATE INDEX idx_campaigns_owner ON campaigns(owner);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Add trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();