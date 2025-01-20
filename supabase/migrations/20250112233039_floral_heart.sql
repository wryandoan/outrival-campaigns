-- Drop existing policies first
DROP POLICY IF EXISTS "campaign_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_delete_policy" ON campaigns;

-- Create simplified policies without the view dependency
CREATE POLICY "campaign_select_policy"
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

CREATE POLICY "campaign_insert_policy"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insert only if the owner is the authenticated user
    auth.uid() = owner
  );

CREATE POLICY "campaign_update_policy"
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

CREATE POLICY "campaign_delete_policy"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());