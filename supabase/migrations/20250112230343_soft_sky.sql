/*
  # Add campaign sharing functionality
  
  1. New Tables
    - `campaign_members`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `user_id` (uuid, references auth.users)
      - `role` (text, enum of roles)
      - `created_at` (timestamp)
      - `invited_by` (uuid, references auth.users)
  
  2. Security
    - Enable RLS on new table
    - Add policies for campaign owners and members
    - Update existing campaign policies
*/

-- Create campaign member roles type
CREATE TYPE campaign_member_role AS ENUM ('viewer', 'editor', 'admin');

-- Create campaign members table
CREATE TABLE campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role campaign_member_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique campaign-user pairs
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign members table
CREATE POLICY "Campaign owners can manage members"
  ON campaign_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

CREATE POLICY "Members can view their own memberships"
  ON campaign_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update campaign policies to allow member access
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
CREATE POLICY "Users can view owned or shared campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own campaigns" ON campaigns;
CREATE POLICY "Owners and editors can manage campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Only owners can delete campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create indexes
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_campaign_members_role ON campaign_members(role);