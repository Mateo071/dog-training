// Edge Function to create a user in Supabase Auth
// This requires the service role key which is only available server-side

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  userMetadata?: {
    role?: string
    created_from_contact_form?: boolean
  }
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
        JSON.stringify({ success: false, error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user details from the request body
    const { email, password, userMetadata }: CreateUserRequest = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email or password in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Creating auth user: ${email}`)

    // Check if user already exists in auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (!listError && existingUsers?.users) {
      const existingUser = existingUsers.users.find(u => u.email === email)
      if (existingUser) {
        console.log(`User already exists in auth: ${email}`)
        return new Response(
          JSON.stringify({
            success: true,
            user: existingUser,
            alreadyExists: true,
            message: 'User already exists in auth'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create the user in Supabase Auth with email auto-confirmed
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMetadata || {
        role: 'client',
        created_from_contact_form: true
      }
    })

    if (createError) {
      console.error('Error creating auth user:', createError)

      // Check if it's a duplicate email error
      if (createError.message?.includes('already been registered') ||
          createError.message?.includes('already exists')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'User with this email already exists',
            alreadyExists: true
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      throw createError
    }

    console.log(`Successfully created auth user: ${email}, id: ${authData.user?.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        message: 'Auth user created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-auth-user function:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create auth user'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To deploy this function:
1. Run: supabase functions deploy create-auth-user
2. The function will be available at: https://<project-ref>.supabase.co/functions/v1/create-auth-user
*/
