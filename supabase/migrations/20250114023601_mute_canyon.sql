-- Add parent/child relationship columns to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS parent_campaign uuid REFERENCES campaigns(campaign_id),
ADD COLUMN IF NOT EXISTS child_campaign uuid REFERENCES campaigns(campaign_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_parent ON campaigns(parent_campaign);
CREATE INDEX IF NOT EXISTS idx_campaigns_child ON campaigns(child_campaign);

-- Add constraint to ensure a campaign can't be its own parent or child
ALTER TABLE campaigns
ADD CONSTRAINT check_campaign_relationships
CHECK (
  campaign_id != parent_campaign AND
  campaign_id != child_campaign AND
  (parent_campaign IS NULL OR child_campaign IS NULL)
);

-- Update RLS policies to include parent/child relationships
DROP POLICY IF EXISTS "select_campaigns" ON campaigns;
CREATE POLICY "select_campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    owner = auth.uid() OR
    campaign_id IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    ) OR
    parent_campaign IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    ) OR
    child_campaign IN (
      SELECT campaign_id 
      FROM campaign_members 
      WHERE user_id = auth.uid()
    )
  );