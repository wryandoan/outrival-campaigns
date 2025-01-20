-- Drop existing policies
DROP POLICY IF EXISTS "select_campaigns" ON campaigns;
DROP POLICY IF EXISTS "insert_campaigns" ON campaigns;
DROP POLICY IF EXISTS "update_campaigns" ON campaigns;
DROP POLICY IF EXISTS "delete_campaigns" ON campaigns;

-- Create new simplified policies
CREATE POLICY "read_campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
    )
  );

CREATE POLICY "create_campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "edit_campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.role IN ('editor', 'admin')
    )
  );

CREATE POLICY "remove_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_members_access 
ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;