-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON campaigns;

-- Create a view to help with member access checks
CREATE OR REPLACE VIEW campaign_member_access AS
SELECT DISTINCT 
  campaign_id,
  user_id,
  role IN ('editor', 'admin') as can_edit
FROM campaign_members;

-- Create new simplified policies using the view
CREATE POLICY "campaign_select_policy"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_member_access 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "campaign_insert_policy"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "campaign_update_policy"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_member_access 
      WHERE user_id = auth.uid() 
      AND can_edit = true
    )
  );

CREATE POLICY "campaign_delete_policy"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());