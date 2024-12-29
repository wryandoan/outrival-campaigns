/*
  # Add goal field to campaigns table
  
  1. Changes
    - Add goal column to campaigns table
    - Make goal required for all campaigns
  
  2. Security
    - Existing RLS policies will automatically apply to the new column
*/

ALTER TABLE campaigns
ADD COLUMN goal text NOT NULL DEFAULT '';