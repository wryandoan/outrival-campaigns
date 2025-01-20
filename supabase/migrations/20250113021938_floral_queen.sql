/*
  # Add cascade delete to foreign key constraints

  1. Changes
    - Modify foreign key constraints to include ON DELETE CASCADE
    - Ensures proper cleanup when users are deleted

  2. Security
    - Maintains referential integrity
    - Prevents orphaned records
*/

-- Modify campaign_members foreign key constraints
ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS fk_user,
ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE campaign_members
DROP CONSTRAINT IF EXISTS fk_invited_by,
ADD CONSTRAINT fk_invited_by 
  FOREIGN KEY (invited_by) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Modify pending_invitations foreign key constraint
ALTER TABLE pending_invitations
DROP CONSTRAINT IF EXISTS pending_invitations_invited_by_fkey,
ADD CONSTRAINT pending_invitations_invited_by_fkey 
  FOREIGN KEY (invited_by) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;