/*
  # Synchronize Auth Users with Public Users

  1. Changes
    - Add trigger to automatically create public.users record when auth.users is created
    - Add trigger to update public.users when auth.users is updated
    - Add function to handle user creation and updates
  
  2. Security
    - Maintains existing RLS policies
    - Ensures data consistency between auth and public users
*/

-- Function to handle user creation and updates
CREATE OR REPLACE FUNCTION handle_auth_user_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (
      id,
      first_name,
      last_name,
      preferred_name,
      email,
      time_zone
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'preferred_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'time_zone', 'UTC')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users SET
      email = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_change();

-- Create trigger for updated users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_change();