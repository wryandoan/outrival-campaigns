-- Drop existing policies for campaign-related tables
DROP POLICY IF EXISTS "view_campaign_contacts" ON campaign_contacts;
DROP POLICY IF EXISTS "manage_campaign_contacts" ON campaign_contacts;

-- Create policies for campaign_contacts
CREATE POLICY "view_campaign_contacts"
  ON campaign_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.campaign_id = campaign_contacts.campaign_id
      AND (
        c.owner = auth.uid() OR
        EXISTS (
          SELECT 1 FROM campaign_members cm
          WHERE cm.campaign_id = c.campaign_id
          AND cm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "manage_campaign_contacts"
  ON campaign_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.campaign_id = campaign_contacts.campaign_id
      AND (
        c.owner = auth.uid() OR
        EXISTS (
          SELECT 1 FROM campaign_members cm
          WHERE cm.campaign_id = c.campaign_id
          AND cm.user_id = auth.uid()
          AND cm.role IN ('editor', 'admin')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.campaign_id = campaign_contacts.campaign_id
      AND (
        c.owner = auth.uid() OR
        EXISTS (
          SELECT 1 FROM campaign_members cm
          WHERE cm.campaign_id = c.campaign_id
          AND cm.user_id = auth.uid()
          AND cm.role IN ('editor', 'admin')
        )
      )
    )
  );

-- Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_lookup 
ON campaign_contacts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_members_role_lookup 
ON campaign_members(campaign_id, user_id, role);

-- Analyze tables to update statistics
ANALYZE campaign_contacts;
ANALYZE campaign_members;