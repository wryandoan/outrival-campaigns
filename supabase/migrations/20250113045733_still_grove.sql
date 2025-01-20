-- Drop existing policies
DROP POLICY IF EXISTS "read_campaigns" ON campaigns;
DROP POLICY IF EXISTS "create_campaigns" ON campaigns;
DROP POLICY IF EXISTS "edit_campaigns" ON campaigns;
DROP POLICY IF EXISTS "remove_campaigns" ON campaigns;

-- Create new policies with simpler queries
CREATE POLICY "read_campaigns"
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
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
      AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "remove_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_members_access 
ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;