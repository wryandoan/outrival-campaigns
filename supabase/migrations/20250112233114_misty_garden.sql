-- Drop all existing campaign policies
DROP POLICY IF EXISTS "campaign_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_delete_policy" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON campaigns;

-- Drop the view if it exists
DROP VIEW IF EXISTS campaign_member_access;

-- Create new, simplified policies
CREATE POLICY "select_campaigns"
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

CREATE POLICY "insert_campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "update_campaigns"
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

CREATE POLICY "delete_campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());