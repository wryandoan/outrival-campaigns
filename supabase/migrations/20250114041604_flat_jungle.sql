-- Function to sync campaign members between parent and child campaigns
CREATE OR REPLACE FUNCTION sync_campaign_member()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_id uuid;
  v_child_id uuid;
BEGIN
  -- Get parent and child campaign IDs
  SELECT parent_campaign, child_campaign 
  INTO v_parent_id, v_child_id
  FROM campaigns 
  WHERE campaign_id = NEW.campaign_id;

  -- If this is a parent campaign and it has a child (test) campaign
  IF v_child_id IS NOT NULL THEN
    -- Add member to child campaign with same role
    INSERT INTO campaign_members (
      campaign_id,
      user_id,
      role,
      invited_by
    ) VALUES (
      v_child_id,
      NEW.user_id,
      NEW.role,
      NEW.invited_by
    )
    ON CONFLICT (campaign_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role;
  END IF;

  -- If this is a child campaign and it has a parent campaign
  IF v_parent_id IS NOT NULL THEN
    -- Add member to parent campaign with same role
    INSERT INTO campaign_members (
      campaign_id,
      user_id,
      role,
      invited_by
    ) VALUES (
      v_parent_id,
      NEW.user_id,
      NEW.role,
      NEW.invited_by
    )
    ON CONFLICT (campaign_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for member sync
DROP TRIGGER IF EXISTS campaign_member_sync_trigger ON campaign_members;
CREATE TRIGGER campaign_member_sync_trigger
  AFTER INSERT OR UPDATE ON campaign_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_campaign_member();

-- Function to handle member removal sync
CREATE OR REPLACE FUNCTION sync_campaign_member_removal()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_id uuid;
  v_child_id uuid;
BEGIN
  -- Get parent and child campaign IDs
  SELECT parent_campaign, child_campaign 
  INTO v_parent_id, v_child_id
  FROM campaigns 
  WHERE campaign_id = OLD.campaign_id;

  -- If this is a parent campaign and it has a child campaign
  IF v_child_id IS NOT NULL THEN
    -- Remove member from child campaign
    DELETE FROM campaign_members 
    WHERE campaign_id = v_child_id 
    AND user_id = OLD.user_id;
  END IF;

  -- If this is a child campaign and it has a parent campaign
  IF v_parent_id IS NOT NULL THEN
    -- Remove member from parent campaign
    DELETE FROM campaign_members 
    WHERE campaign_id = v_parent_id 
    AND user_id = OLD.user_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for member removal sync
DROP TRIGGER IF EXISTS campaign_member_removal_sync_trigger ON campaign_members;
CREATE TRIGGER campaign_member_removal_sync_trigger
  AFTER DELETE ON campaign_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_campaign_member_removal();