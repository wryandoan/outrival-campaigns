/*
  # Fix user deletion constraints

  1. Changes
    - Drop and recreate all user-related foreign keys with CASCADE
    - Remove any remaining view dependencies
    - Update all user references to point directly to auth.users

  2. Security
    - Maintains data integrity
    - Ensures proper cascading deletes
*/

-- Drop all existing foreign key constraints first
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS "campaign_members_user_id_fkey",
DROP CONSTRAINT IF EXISTS "campaign_members_invited_by_fkey",
DROP CONSTRAINT IF EXISTS "fk_user",
DROP CONSTRAINT IF EXISTS "fk_invited_by";

ALTER TABLE pending_invitations
DROP CONSTRAINT IF EXISTS "pending_invitations_invited_by_fkey";

-- Drop the view to remove any dependencies
DROP VIEW IF EXISTS user_emails CASCADE;

-- Recreate all foreign key constraints with proper CASCADE
ALTER TABLE campaign_members
ADD CONSTRAINT "campaign_members_user_id_fkey"
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE,
ADD CONSTRAINT "campaign_members_invited_by_fkey"
  FOREIGN KEY (invited_by)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE pending_invitations
ADD CONSTRAINT "pending_invitations_invited_by_fkey"
  FOREIGN KEY (invited_by)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Recreate the view without any dependencies
CREATE VIEW user_emails AS
SELECT 
    u.id as user_id,
    u.email as email
FROM auth.users u;

-- Set proper permissions
GRANT SELECT ON user_emails TO authenticated;
GRANT SELECT ON user_emails TO service_role;

-- Add an index to improve view performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Verify and clean up any remaining references
DO $$ 
DECLARE
  r RECORD;  -- Declare r as a record type
BEGIN
  -- Drop any remaining foreign key constraints that might reference the view
  FOR r IN (
    SELECT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (ccu.table_name = 'user_emails' OR tc.table_name = 'user_emails')
  ) LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.table_name, r.constraint_name);
  END LOOP;
END $$;