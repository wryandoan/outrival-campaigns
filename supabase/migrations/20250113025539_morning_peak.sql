-- Drop all existing policies
DROP POLICY IF EXISTS "select_campaigns" ON campaigns;
DROP POLICY IF EXISTS "insert_campaigns" ON campaigns;
DROP POLICY IF EXISTS "update_campaigns" ON campaigns;
DROP POLICY IF EXISTS "delete_campaigns" ON campaigns;

-- Create base policy for owner access
CREATE POLICY "owner_access"
  ON campaigns
  TO authenticated
  USING (owner = auth.uid());

-- Create separate policy for member read access
CREATE POLICY "member_read_access"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
    )
  );

-- Create separate policy for member update access
CREATE POLICY "member_update_access"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.role IN ('editor', 'admin')
    )
  );

-- Ensure indexes exist for performance
DROP INDEX IF EXISTS idx_campaigns_owner;
DROP INDEX IF EXISTS idx_campaign_members_lookup;

CREATE INDEX idx_campaigns_owner ON campaigns(owner);
CREATE INDEX idx_campaign_members_lookup ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;