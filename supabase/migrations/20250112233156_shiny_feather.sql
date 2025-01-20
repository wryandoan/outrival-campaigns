-- Drop all existing campaign policies
DROP POLICY IF EXISTS "campaign_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_delete_policy" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "select_campaigns" ON campaigns;
DROP POLICY IF EXISTS "insert_campaigns" ON campaigns;
DROP POLICY IF EXISTS "update_campaigns" ON campaigns;
DROP POLICY IF EXISTS "delete_campaigns" ON campaigns;

-- Drop any existing views
DROP VIEW IF EXISTS campaign_member_access;

-- Create a materialized view for member access
CREATE MATERIALIZED VIEW member_access AS
SELECT DISTINCT 
  cm.campaign_id,
  cm.user_id,
  cm.role IN ('editor', 'admin') as can_edit
FROM campaign_members cm;

-- Create index on materialized view
CREATE UNIQUE INDEX member_access_idx ON member_access(campaign_id, user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_member_access()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY member_access;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_member_access_trigger
AFTER INSERT OR UPDATE OR DELETE ON campaign_members
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_member_access();

-- Create new simplified policies using materialized view
CREATE POLICY "view_campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM member_access 
      WHERE member_access.campaign_id = campaigns.campaign_id
      AND member_access.user_id = auth.uid()
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
      FROM member_access 
      WHERE member_access.campaign_id = campaigns.campaign_id
      AND member_access.user_id = auth.uid()
      AND member_access.can_edit = true
    )
  );

CREATE POLICY "remove_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Initial refresh of materialized view
REFRESH MATERIALIZED VIEW member_access;