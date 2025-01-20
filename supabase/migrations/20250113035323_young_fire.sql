-- Drop existing policies
DROP POLICY IF EXISTS "manage_campaign_members" ON campaign_members;
DROP POLICY IF EXISTS "view_campaign_members" ON campaign_members;
DROP POLICY IF EXISTS "campaign_owners_manage_members" ON campaign_members;

-- Create new policies for campaign_members table
CREATE POLICY "select_campaign_members"
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
    -- Allow members to view their own membership
    user_id = auth.uid()
  );

CREATE POLICY "insert_campaign_members"
  ON campaign_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only campaign owners can add members
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

CREATE POLICY "update_campaign_members"
  ON campaign_members
  FOR UPDATE
  TO authenticated
  USING (
    -- Only campaign owners can update members
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

CREATE POLICY "delete_campaign_members"
  ON campaign_members
  FOR DELETE
  TO authenticated
  USING (
    -- Only campaign owners can remove members
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );