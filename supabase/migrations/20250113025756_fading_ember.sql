-- Drop all existing policies and related objects
DROP POLICY IF EXISTS "basic_select" ON campaigns;
DROP POLICY IF EXISTS "basic_insert" ON campaigns;
DROP POLICY IF EXISTS "basic_update" ON campaigns;
DROP POLICY IF EXISTS "basic_delete" ON campaigns;
DROP TRIGGER IF EXISTS sync_member_access_trigger ON campaign_members;
DROP FUNCTION IF EXISTS sync_member_access();
DROP TABLE IF EXISTS member_access_cache;

-- Create ultra-simple policies with no subqueries
CREATE POLICY "read_own_campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "read_member_campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "update_own_campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "update_member_campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
      AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "delete_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_role ON campaign_members(user_id, role);
CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id);

-- Analyze tables
ANALYZE campaigns;
ANALYZE campaign_members;