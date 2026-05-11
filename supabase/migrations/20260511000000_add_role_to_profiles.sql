-- Add role column to profiles for storing user's film industry role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;
