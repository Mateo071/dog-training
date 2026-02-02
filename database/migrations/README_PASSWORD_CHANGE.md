# Password Change Feature

This feature implements required password changes for users with temporary passwords and provides a working "Change Password" option in settings.

## Database Migration

### Running the Migration

To apply the database migration, you need to run the SQL in `add_must_change_password.sql` against your Supabase database.

**Option 1: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Paste the contents of `add_must_change_password.sql`
4. Click "Run"

**Option 2: Supabase CLI**
```bash
supabase db push
```

### What the Migration Does

The migration adds:
- `must_change_password` boolean column to the `users` table (defaults to `false`)
- A database comment explaining the field's purpose
- An index on `must_change_password` for performance when querying users who need to change passwords

## Setting Temporary Passwords

When creating a user with a temporary password (e.g., admin creates a client), set the `must_change_password` flag:

```javascript
// Example: When creating a user with temporary password
const { data: userData, error: userError } = await supabase
  .from('users')
  .update({ must_change_password: true })
  .eq('id', userId);
```

## How It Works

1. **User Signs In**: When a user with `must_change_password = true` signs in, the AuthContext detects this flag

2. **Forced Redirect**: The ProtectedRoute component automatically redirects them to `/change-password-required`

3. **Password Change Required Page**: User must create a new secure password meeting requirements:
   - At least 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

4. **Flag Cleared**: Once password is changed successfully, the `must_change_password` flag is set to `false`

5. **Continue to Dashboard**: User is redirected to the dashboard and can use the system normally

## Voluntary Password Change

Users can change their password anytime from Settings:

1. Navigate to `/dashboard/settings`
2. Click "Change Password" under "Account Security"
3. Enter current password and new password
4. Submit the form

## Components

- **ChangePasswordRequired** (`/change-password-required`): Forced password change page for temporary passwords
- **ChangePassword** (`/dashboard/change-password`): Voluntary password change page from settings
- **AuthContext**: Tracks `mustChangePassword` state
- **ProtectedRoute**: Enforces password change requirement

## Security Features

- Password strength validation
- Current password verification for voluntary changes
- Eye icons to toggle password visibility
- Automatic clearing of `must_change_password` flag after successful change
- Protected routes ensure users can't bypass the requirement
