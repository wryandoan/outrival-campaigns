-- Drop existing policies for contacts table
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

-- Create new policies for contacts table that include campaign member access
CREATE POLICY "view_contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.contact_id = contacts.id
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

CREATE POLICY "manage_contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.contact_id = contacts.id
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
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.contact_id = contacts.id
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
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_lookup 
ON contacts(id);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_lookup 
ON campaign_contacts(contact_id);

-- Analyze tables to update statistics
ANALYZE contacts;
ANALYZE campaign_contacts;