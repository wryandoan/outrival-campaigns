-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_auth_email;
DROP FUNCTION IF EXISTS get_user_email;

-- Create a secure function to get user email that properly handles auth.users access
CREATE OR REPLACE FUNCTION get_user_email(user_id uuid)
RETURNS TABLE (
  email text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT u.email::text
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

-- Create a view to safely expose user emails
CREATE OR REPLACE VIEW user_emails AS
SELECT 
  id as user_id,
  get_user_email(id) as email
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON user_emails TO authenticated;

-- Update campaign_members policies to use the view
DROP POLICY IF EXISTS "Campaign owners can manage members" ON campaign_members;
DROP POLICY IF EXISTS "Members can view their own memberships" ON campaign_members;

CREATE POLICY "view_campaign_members"
  ON campaign_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = campaign_members.campaign_id
      AND campaigns.owner = auth.uid()
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