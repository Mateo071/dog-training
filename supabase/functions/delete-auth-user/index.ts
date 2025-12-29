// Edge Function to delete a user from Supabase Auth
// This requires the service role key which is only available server-side

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the caller is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if caller is admin
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', callerUser.id)
      .single()

    if (profileError || callerProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user ID to delete from the request body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === callerUser.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Deleting auth user: ${userId}`)

    // Delete the user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)

      // If user not found in auth, that's okay - they may have been partially deleted
      if (deleteError.message?.includes('User not found')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'User not found in auth (may have been already deleted)',
            userId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      throw deleteError
    }

    console.log(`Successfully deleted auth user: ${userId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auth user deleted successfully',
        userId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in delete-auth-user function:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete auth user'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To deploy this function:
1. Run: supabase functions deploy delete-auth-user
2. The function will be available at: https://<project-ref>.supabase.co/functions/v1/delete-auth-user
*/
