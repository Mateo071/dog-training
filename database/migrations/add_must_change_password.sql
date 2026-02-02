-- Add must_change_password field to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN public.users.must_change_password IS 'Flag to indicate if user must change their password on next login (e.g., temporary password)';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_must_change_password ON public.users(must_change_password) WHERE must_change_password = true;
