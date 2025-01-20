-- Drop all existing policies and functions
DROP POLICY IF EXISTS "campaigns_select" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete" ON campaigns;
DROP FUNCTION IF EXISTS check_campaign_member_access;
DROP FUNCTION IF EXISTS check_campaign_editor_access;

-- Create a single, simple policy for each operation type
CREATE POLICY "allow_select"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "allow_insert"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "allow_update"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
      AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "allow_delete"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner);
CREATE INDEX IF NOT EXISTS idx_campaign_members_access ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;