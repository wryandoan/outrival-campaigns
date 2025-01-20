-- Drop existing select policy
DROP POLICY IF EXISTS "select_campaign_members" ON campaign_members;

-- Create new select policy that allows both owners and members to view
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
    -- Allow members to view other members in their campaigns
    EXISTS (
      SELECT 1 FROM campaign_members my_membership
      WHERE my_membership.campaign_id = campaign_members.campaign_id
      AND my_membership.user_id = auth.uid()
    )
  );