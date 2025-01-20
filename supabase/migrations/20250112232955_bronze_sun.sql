-- Drop existing policies
DROP POLICY IF EXISTS "campaign_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaign_delete_policy" ON campaigns;

-- Create new policies with proper security context
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