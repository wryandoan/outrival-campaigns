-- Drop existing insert policy
DROP POLICY IF EXISTS "insert_campaign_members" ON campaign_members;

-- Create new insert policy that allows both campaign owners and invited users
CREATE POLICY "insert_campaign_members"
  ON campaign_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Campaign owners can add members
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
    )
    OR
    -- Users with valid invitations can add themselves
    EXISTS (
      SELECT 1 FROM pending_invitations
      WHERE pending_invitations.campaign_id = campaign_members.campaign_id
      AND pending_invitations.email IN (
        SELECT email FROM user_emails WHERE user_id = auth.uid()
      )
      AND pending_invitations.expires_at > now()
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.role = pending_invitations.role
    )
  );