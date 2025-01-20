-- Drop existing policies for campaign-related tables
DROP POLICY IF EXISTS "view_campaign_contacts" ON campaign_contacts;
DROP POLICY IF EXISTS "view_interactions" ON interactions;
DROP POLICY IF EXISTS "view_contact_status_history" ON contact_status_history;

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

-- Create policies for interactions
CREATE POLICY "view_interactions"
  ON interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = interactions.campaign_contact_id
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

-- Create policies for contact_status_history
CREATE POLICY "view_contact_status_history"
  ON contact_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = contact_status_history.campaign_contact_id
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

-- Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign 
ON campaign_contacts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_interactions_campaign_contact 
ON interactions(campaign_contact_id);

CREATE INDEX IF NOT EXISTS idx_status_history_campaign_contact 
ON contact_status_history(campaign_contact_id);

-- Analyze tables to update statistics
ANALYZE campaign_contacts;
ANALYZE interactions;
ANALYZE contact_status_history;