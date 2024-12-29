/*
  # Update Campaign Schema to Connect with Users

  1. Changes
    - Add user fields to campaigns table
    - Drop contacts table (since user info is now in users table)
    - Update campaign status tracking
  
  2. Security
    - Update RLS policies for new structure
*/

-- Add new columns to campaigns
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS status contact_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transcript text,
ADD COLUMN IF NOT EXISTS recording_url text;

-- Drop contacts table and related objects
DROP TABLE IF EXISTS contacts CASCADE;

-- Update campaign policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;

CREATE POLICY "Users can view campaigns they're targeted in"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND NOT users.do_not_contact
    )
  );

CREATE POLICY "Campaign owners can manage campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());