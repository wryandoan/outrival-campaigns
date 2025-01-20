-- Drop existing policies
DROP POLICY IF EXISTS "view_campaigns" ON campaigns;
DROP POLICY IF EXISTS "create_campaigns" ON campaigns;
DROP POLICY IF EXISTS "modify_campaigns" ON campaigns;
DROP POLICY IF EXISTS "remove_campaigns" ON campaigns;

-- Create simplified policies
CREATE POLICY "select_policy"
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

CREATE POLICY "insert_policy"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "update_policy"
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

CREATE POLICY "delete_policy"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_role 
ON campaign_members(user_id, role);