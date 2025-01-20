-- Drop all existing policies
DROP POLICY IF EXISTS "owner_access" ON campaigns;
DROP POLICY IF EXISTS "member_read_access" ON campaigns;
DROP POLICY IF EXISTS "member_update_access" ON campaigns;

-- Create a function to check member access
CREATE OR REPLACE FUNCTION check_campaign_member_access(campaign_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM campaign_members 
    WHERE campaign_members.campaign_id = $1
    AND campaign_members.user_id = $2
  );
$$;

-- Create a function to check editor access
CREATE OR REPLACE FUNCTION check_campaign_editor_access(campaign_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM campaign_members 
    WHERE campaign_members.campaign_id = $1
    AND campaign_members.user_id = $2
    AND campaign_members.role IN ('editor', 'admin')
  );
$$;

-- Create simplified policies using the helper functions
CREATE POLICY "campaigns_select"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    check_campaign_member_access(campaign_id, auth.uid())
  );

CREATE POLICY "campaigns_insert"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "campaigns_update"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    check_campaign_editor_access(campaign_id, auth.uid())
  );

CREATE POLICY "campaigns_delete"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner);
CREATE INDEX IF NOT EXISTS idx_campaign_members_lookup ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaigns;
ANALYZE campaign_members;