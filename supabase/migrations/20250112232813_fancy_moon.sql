-- Drop existing campaign members table and recreate with proper relationships
DROP TABLE IF EXISTS campaign_members CASCADE;

CREATE TABLE campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role campaign_member_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Add foreign key constraints with auth.users
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_invited_by FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  
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

-- Create indexes
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_campaign_members_role ON campaign_members(role);

-- Create a function to get user email
CREATE OR REPLACE FUNCTION get_auth_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;