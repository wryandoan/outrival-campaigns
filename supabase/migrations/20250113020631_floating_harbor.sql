/*
  # Update user_emails view for safe user deletion

  1. Changes
    - Drop existing user_emails view
    - Create new user_emails view that directly references auth.users
    - Set proper permissions for authenticated users

  2. Security
    - Maintains security by only exposing necessary user data
    - Allows safe user deletion by removing view dependency
*/

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.user_emails;

-- Create the new view
CREATE VIEW public.user_emails AS
SELECT 
    users.id as user_id,
    users.email as email
FROM auth.users;

-- Set proper permissions
GRANT SELECT ON public.user_emails TO authenticated;
GRANT SELECT ON public.user_emails TO service_role;