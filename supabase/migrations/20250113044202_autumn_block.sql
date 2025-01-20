-- Drop existing policies
DROP POLICY IF EXISTS "select_campaign_members" ON campaign_members;
DROP POLICY IF EXISTS "insert_campaign_members" ON campaign_members;
DROP POLICY IF EXISTS "update_campaign_members" ON campaign_members;
DROP POLICY IF EXISTS "delete_campaign_members" ON campaign_members;

-- Create new policies with proper access control
CREATE POLICY "view_campaign_members"
  ON campaign_members
  FOR SELECT
  TO authenticated
  USING (
    -- Allow campaign owners to view all members
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
    OR
    -- Allow members to view other members in their campaigns
    EXISTS (
      SELECT 1 FROM campaign_members my_membership
      WHERE my_membership.campaign_id = campaign_members.campaign_id
      AND my_membership.user_id = auth.uid()
    )
  );

CREATE POLICY "manage_campaign_members"
  ON campaign_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign_user 
ON campaign_members(campaign_id, user_id);