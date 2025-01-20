/*
  # Final fix for user deletion constraints

  1. Changes
    - Drop and recreate view without any dependencies
    - Ensure all foreign keys have ON DELETE CASCADE
    - Remove any remaining view references
    - Add proper indexes

  2. Security
    - Maintains RLS policies
    - Ensures proper cascading deletes
*/

-- First drop the view and any dependencies
DROP VIEW IF EXISTS user_emails CASCADE;

-- Drop any existing foreign key constraints
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS "campaign_members_user_id_fkey" CASCADE,
DROP CONSTRAINT IF EXISTS "campaign_members_invited_by_fkey" CASCADE,
DROP CONSTRAINT IF EXISTS "fk_user" CASCADE,
DROP CONSTRAINT IF EXISTS "fk_invited_by" CASCADE;

ALTER TABLE pending_invitations
DROP CONSTRAINT IF EXISTS "pending_invitations_invited_by_fkey" CASCADE;

-- Recreate the view as a simple SELECT
CREATE VIEW user_emails AS
SELECT 
    id as user_id,
    email
FROM auth.users;

-- Set permissions
GRANT SELECT ON user_emails TO authenticated;
GRANT SELECT ON user_emails TO service_role;

-- Add foreign key constraints with CASCADE
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_id 
    ON campaign_members(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_invited_by 
    ON campaign_members(invited_by);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_invited_by 
    ON pending_invitations(invited_by);

-- Clean up any remaining references
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (ccu.table_name = 'user_emails' OR tc.table_name = 'user_emails')
    ) LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE', 
            r.table_name, r.constraint_name);
    END LOOP;
END $$;