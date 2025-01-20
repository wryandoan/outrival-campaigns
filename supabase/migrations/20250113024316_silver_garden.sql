/*
  # Fix user references and constraints

  1. Changes
    - Remove view references from foreign keys
    - Update campaign_members constraints
    - Clean up any remaining view dependencies

  2. Security
    - Maintains data integrity
    - Ensures proper cascading deletes
*/

-- First, drop any existing foreign key constraints that reference the view
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS "campaign_members_user_id_fkey";

-- Recreate the constraint to reference auth.users directly
ALTER TABLE campaign_members
ADD CONSTRAINT "campaign_members_user_id_fkey"
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update any composite foreign keys or references
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS "campaign_members_user_email_fkey";

-- Ensure the view has no dependencies
DROP VIEW IF EXISTS user_emails CASCADE;

-- Recreate the view without any foreign key references
CREATE VIEW user_emails AS
SELECT 
    users.id as user_id,
    users.email as email
FROM auth.users;

-- Set proper permissions
GRANT SELECT ON user_emails TO authenticated;
GRANT SELECT ON user_emails TO service_role;