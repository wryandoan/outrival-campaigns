/*
  # Fix campaign policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create new non-recursive policies for campaigns
    - Simplify policy logic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view owned or shared campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners and editors can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Only owners can delete campaigns" ON campaigns;

-- Create new policies
CREATE POLICY "Users can view owned or shared campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
      AND role IN ('editor', 'admin')
    )
  )
  WITH CHECK (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
      AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Only owners can delete campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "Only owners can insert campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());