-- Drop the materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS member_access CASCADE;
DROP TRIGGER IF EXISTS refresh_member_access_trigger ON campaign_members;
DROP FUNCTION IF EXISTS refresh_member_access();

-- Update campaign policies to work without the materialized view
DROP POLICY IF EXISTS "view_campaigns" ON campaigns;
DROP POLICY IF EXISTS "create_campaigns" ON campaigns;
DROP POLICY IF EXISTS "modify_campaigns" ON campaigns;
DROP POLICY IF EXISTS "remove_campaigns" ON campaigns;

CREATE POLICY "view_campaigns"
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

CREATE POLICY "modify_campaigns"
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