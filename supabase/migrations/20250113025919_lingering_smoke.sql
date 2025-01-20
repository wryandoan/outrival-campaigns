-- Drop all existing policies
DROP POLICY IF EXISTS "read_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "read_member_campaigns" ON campaigns;
DROP POLICY IF EXISTS "insert_campaigns" ON campaigns;
DROP POLICY IF EXISTS "update_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "update_member_campaigns" ON campaigns;
DROP POLICY IF EXISTS "delete_campaigns" ON campaigns;

-- Create a single SELECT policy that combines owner and member access
CREATE POLICY "select_campaigns"
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

-- Simple INSERT policy for owners only
CREATE POLICY "insert_campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

-- Single UPDATE policy that combines owner and editor access
CREATE POLICY "update_campaigns"
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

-- Simple DELETE policy for owners only
CREATE POLICY "delete_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Ensure proper indexes exist
DROP INDEX IF EXISTS idx_campaigns_owner;
DROP INDEX IF EXISTS idx_campaign_members_lookup;

CREATE INDEX idx_campaigns_owner ON campaigns(owner);
CREATE INDEX idx_campaign_members_lookup ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;