-- Drop all existing policies
DROP POLICY IF EXISTS "allow_select" ON campaigns;
DROP POLICY IF EXISTS "allow_insert" ON campaigns;
DROP POLICY IF EXISTS "allow_update" ON campaigns;
DROP POLICY IF EXISTS "allow_delete" ON campaigns;

-- Create a temporary table to store member access
CREATE TABLE IF NOT EXISTS member_access_cache (
  campaign_id uuid,
  user_id uuid,
  role text,
  PRIMARY KEY (campaign_id, user_id)
);

-- Copy current member access data
INSERT INTO member_access_cache
SELECT campaign_id, user_id, role
FROM campaign_members
ON CONFLICT DO NOTHING;

-- Create basic policies using the cache table
CREATE POLICY "basic_select"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM member_access_cache 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "basic_insert"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "basic_update"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM member_access_cache 
      WHERE user_id = auth.uid() 
      AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "basic_delete"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create function to sync cache
CREATE OR REPLACE FUNCTION sync_member_access()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO member_access_cache (campaign_id, user_id, role)
    VALUES (NEW.campaign_id, NEW.user_id, NEW.role)
    ON CONFLICT (campaign_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE member_access_cache
    SET role = NEW.role
    WHERE campaign_id = NEW.campaign_id AND user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM member_access_cache
    WHERE campaign_id = OLD.campaign_id AND user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep cache in sync
CREATE TRIGGER sync_member_access_trigger
AFTER INSERT OR UPDATE OR DELETE ON campaign_members
FOR EACH ROW
EXECUTE FUNCTION sync_member_access();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_access_cache_user 
ON member_access_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_member_access_cache_lookup 
ON member_access_cache(campaign_id, user_id, role);

-- Analyze tables
ANALYZE campaigns;
ANALYZE campaign_members;
ANALYZE member_access_cache;