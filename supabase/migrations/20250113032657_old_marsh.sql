/*
  # Restore pending invitations functionality

  1. New Tables
    - `pending_invitations`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `email` (text)
      - `role` (campaign_member_role)
      - `invited_by` (uuid, references auth.users)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on pending_invitations table
    - Add policies for campaign owners to manage invitations
    - Add policy for users to view their own invitations
*/

-- Create pending invitations table
CREATE TABLE pending_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  email text NOT NULL,
  role campaign_member_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique campaign-email pairs
  UNIQUE(campaign_id, email)
);

-- Enable RLS
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "campaign_owners_manage_invitations"
  ON pending_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = pending_invitations.campaign_id
      AND campaigns.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.campaign_id = pending_invitations.campaign_id
      AND campaigns.owner = auth.uid()
    )
  );

CREATE POLICY "users_view_own_invitations"
  ON pending_invitations
  FOR SELECT
  TO authenticated
  USING (email IN (
    SELECT email FROM user_emails WHERE user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_pending_invitations_campaign ON pending_invitations(campaign_id);
CREATE INDEX idx_pending_invitations_email ON pending_invitations(email);
CREATE INDEX idx_pending_invitations_token ON pending_invitations(token);
CREATE INDEX idx_pending_invitations_expires ON pending_invitations(expires_at);

-- Add function to clean expired invitations
CREATE OR REPLACE FUNCTION clean_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM pending_invitations
  WHERE expires_at < now();
END;
$$;