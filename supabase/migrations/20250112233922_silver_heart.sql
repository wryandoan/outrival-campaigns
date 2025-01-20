-- Create pending invitations table
CREATE TABLE pending_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  email text NOT NULL,
  role campaign_member_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique campaign-email pairs
  UNIQUE(campaign_id, email)
);

-- Enable RLS
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Campaign owners can manage invitations"
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

-- Create indexes
CREATE INDEX idx_pending_invitations_campaign ON pending_invitations(campaign_id);
CREATE INDEX idx_pending_invitations_email ON pending_invitations(email);
CREATE INDEX idx_pending_invitations_token ON pending_invitations(token);
CREATE INDEX idx_pending_invitations_expires ON pending_invitations(expires_at);