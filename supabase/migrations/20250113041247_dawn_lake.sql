-- Drop and recreate the accept_invitation function with proper transaction handling
CREATE OR REPLACE FUNCTION accept_invitation(invite_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation pending_invitations;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Get the current user's ID and email
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  -- Get and validate the invitation
  SELECT * INTO v_invitation 
  FROM pending_invitations 
  WHERE token = invite_token
  AND expires_at > now()
  AND email = v_user_email;
  
  -- If no valid invitation found, return false
  IF v_invitation IS NULL THEN
    RETURN false;
  END IF;

  -- Insert the new campaign member
  INSERT INTO campaign_members (
    campaign_id,
    user_id,
    role,
    invited_by
  ) VALUES (
    v_invitation.campaign_id,
    v_user_id,
    v_invitation.role,
    v_invitation.invited_by
  );

  -- Delete the used invitation
  DELETE FROM pending_invitations 
  WHERE id = v_invitation.id;

  RETURN true;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in accept_invitation: %', SQLERRM;
  RETURN false;
END;
$$;