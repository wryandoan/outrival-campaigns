/*
  # Add stored procedure for linking contacts

  Creates a stored procedure to safely handle contact status enum casting when linking contacts to campaigns.

  1. New Functions
    - `link_contacts_to_campaign`: Safely links contacts to campaigns with proper enum handling
*/

CREATE OR REPLACE FUNCTION link_contacts_to_campaign(
  p_campaign_id uuid,
  p_contact_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO campaign_contacts (
    campaign_id,
    contact_id,
    contact_status,
    assigned_date
  )
  SELECT 
    p_campaign_id,
    id,
    'Awaiting Contact'::contact_status,
    now()
  FROM unnest(p_contact_ids) AS id;
END;
$$;