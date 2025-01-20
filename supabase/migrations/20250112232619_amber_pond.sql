-- Drop existing policies
DROP POLICY IF EXISTS "Users can view owned or shared campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Only owners can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Only owners can insert campaigns" ON campaigns;

-- Create simplified policies without circular references
CREATE POLICY "Users can view campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM campaign_members 
      WHERE campaign_members.campaign_id = campaigns.campaign_id
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Users can insert campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

CREATE POLICY "Users can delete campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());