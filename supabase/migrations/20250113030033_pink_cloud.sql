-- Drop pending invitations table and related objects
DROP TABLE IF EXISTS pending_invitations CASCADE;

-- Drop existing user_emails view
DROP VIEW IF EXISTS user_emails CASCADE;

-- Create new simplified user_emails view
CREATE OR REPLACE VIEW user_emails AS
SELECT 
  id as user_id,
  email
FROM auth.users;

-- Set proper permissions
GRANT SELECT ON user_emails TO authenticated;
GRANT SELECT ON user_emails TO service_role;

-- Create index to improve performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Clean up any orphaned campaign members
DELETE FROM campaign_members
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add NOT NULL constraints to campaign_members
ALTER TABLE campaign_members
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN invited_by SET NOT NULL;

-- Add foreign key constraints with proper CASCADE
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS campaign_members_user_id_fkey,
ADD CONSTRAINT campaign_members_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS campaign_members_invited_by_fkey,
ADD CONSTRAINT campaign_members_invited_by_fkey
  FOREIGN KEY (invited_by)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;