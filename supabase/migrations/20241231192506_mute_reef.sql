-- Create update policy for contact status history
CREATE POLICY "Users can update status history for their campaign contacts"
  ON contact_status_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM campaign_contacts cc
      JOIN campaigns c ON c.campaign_id = cc.campaign_id
      WHERE cc.campaign_user_id = contact_status_history.campaign_contact_id
      AND c.owner = auth.uid()
    )
  );