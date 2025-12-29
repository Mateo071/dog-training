import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Users & Profiles
export const users = {
  getProfile: withErrorHandling('db.getProfile', async (userId, retryCount = 0) => {
    try {
      const result = await supabase.from('profiles').select(`
        id,
        user_id,
        role,
        first_name,
        last_name,
        phone,
        address,
        emergency_contact,
        emergency_phone,
        how_heard_about_us,
        notes,
        created_from_contact_form,
        profile_completed,
        onboarding_step,
        signup_completed_at,
        is_active,
        created_at,
        updated_at
      `).eq('user_id', userId).single();
      
      // Retry on 406 errors up to 3 times
      if (result.error && (result.error.code === '406' || result.error.status === 406) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return users.getProfile(userId, retryCount + 1);
      }
      
      return result;
    } catch (networkError) {
      // Retry on network errors
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return users.getProfile(userId, retryCount + 1);
      }
      
      throw networkError;
    }
  }),
  
  getUser: withErrorHandling('db.getUser', async (userId, retryCount = 0) => {
    try {
      // Try to get user from the profile with user data instead of direct users table access
      const result = await supabase
        .from('profiles')
        .select(`
          user_id,
          role,
          users!inner(id, email, role, is_active, created_at)
        `)
        .eq('user_id', userId)
        .single();
      
      // Transform the result to match expected user structure
      if (result.data && !result.error) {
        const transformedData = {
          id: result.data.users.id,
          email: result.data.users.email,
          role: result.data.users.role,
          is_active: result.data.users.is_active,
          created_at: result.data.users.created_at
        };
        return { data: transformedData, error: null };
      }
      
      // Retry on 406 errors up to 3 times
      if (result.error && (result.error.code === '406' || result.error.status === 406) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return users.getUser(userId, retryCount + 1);
      }
      
      return result;
    } catch (networkError) {
      // Retry on network errors
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return users.getUser(userId, retryCount + 1);
      }
      
      throw networkError;
    }
  }),
  
  updateProfile: withErrorHandling('db.updateProfile', (userId, updates) => 
    supabase.from('profiles').update(updates).eq('user_id', userId)),
  
  // Onboarding data management
  saveOnboardingData: withErrorHandling('db.saveOnboardingData', (userId, step, formData) => 
    supabase.from('profiles').update({ 
      onboarding_step: step,
      onboarding_data: formData 
    }).eq('user_id', userId)),
  
  getOnboardingData: withErrorHandling('db.getOnboardingData', (userId) => 
    supabase.from('profiles').select('onboarding_step, onboarding_data').eq('user_id', userId).single()),
    
  getAllProfiles: withErrorHandling('db.getAllProfiles', () => 
    supabase.from('profiles').select(`
      id,
      user_id,
      role,
      first_name,
      last_name,
      phone,
      address,
      emergency_contact,
      emergency_phone,
      how_heard_about_us,
      notes,
      created_from_contact_form,
      profile_completed,
      onboarding_step,
      signup_completed_at,
      is_active,
      created_at,
      updated_at,
      dogs(id, name, breed, training_analytics(total_sessions, last_session_date))
    `).eq('is_active', true).order('created_at', { ascending: false })),
    
  // Admin-specific function that includes user data (requires admin permissions)
  getAllProfilesWithUserData: withErrorHandling('db.getAllProfilesWithUserData', () =>
    supabase.from('profiles').select(`
      id,
      user_id,
      role,
      first_name,
      last_name,
      phone,
      address,
      emergency_contact,
      emergency_phone,
      how_heard_about_us,
      notes,
      created_from_contact_form,
      profile_completed,
      onboarding_step,
      signup_completed_at,
      is_active,
      created_at,
      updated_at,
      users!inner(email, role, is_active),
      dogs(id, name, breed, training_analytics(total_sessions, last_session_date)),
      referrals!referrer_id(referral_code)
    `).eq('is_active', true)
      .eq('users.role', 'client')
      .order('created_at', { ascending: false })),
    
  // Get active clients for messaging (admin function)
  getActiveClients: withErrorHandling('db.getActiveClients', () => 
    supabase.from('profiles').select(`
      id,
      first_name,
      last_name,
      profile_completed,
      onboarding_step,
      users!inner(email, is_active)
    `).eq('users.role', 'client')
      .eq('users.is_active', true)
      .order('profile_completed', { ascending: false })
      .order('first_name')),
      
  // Get single profile with user data (admin function)
  getProfileWithUserData: withErrorHandling('db.getProfileWithUserData', (profileId) => 
    supabase.from('profiles').select(`
      id,
      user_id,
      role,
      first_name,
      last_name,
      phone,
      address,
      emergency_contact,
      emergency_phone,
      how_heard_about_us,
      notes,
      created_from_contact_form,
      profile_completed,
      onboarding_step,
      signup_completed_at,
      created_at,
      updated_at,
      users!inner(email, role, is_active, created_at)
    `).eq('id', profileId).single()),
  
  // Deactivate client by email
  deactivateClientByEmail: withErrorHandling('db.deactivateClientByEmail', async (email) => {
    // First find the user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    // Update both users and profiles tables to set is_active = false
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userData.id);

    if (userUpdateError) throw userUpdateError;

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('user_id', userData.id);

    if (profileUpdateError) throw profileUpdateError;

    return { success: true };
  }),

  // Permanently delete client and all associated data
  deleteClientCompletely: withErrorHandling('db.deleteClientCompletely', async (email) => {
    
    let userData, profileData;
    
    // First try to find user by email
    const { data: userResult, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError) {
      
      // Alternative: Try to find via contact submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('contact_submissions')
        .select('assigned_profile_id, email')
        .eq('email', email)
        .eq('status', 'converted')
        .single();
        
      if (submissionError || !submissionData?.assigned_profile_id) {
        throw new Error(`No user or converted contact submission found with email: ${email}`);
      }
      
      // Get profile directly from submission
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .eq('id', submissionData.assigned_profile_id)
        .single();
        
      if (profileError || !profileResult) {
        throw new Error(`Profile not found via contact submission: ${profileError?.message || 'No profile data'}`);
      }
      
      profileData = profileResult;
      
      // Get user data from profile
      const { data: userFromProfile, error: userFromProfileError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', profileResult.user_id)
        .single();
        
      if (userFromProfileError) {
        console.warn('Could not find user record for profile:', userFromProfileError);
        userData = { id: profileResult.user_id, email: email }; // Use what we have
      } else {
        userData = userFromProfile;
      }
    } else {
      userData = userResult;
      
      // Find the profile for this user
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', userData.id)
        .single();

      if (profileError || !profileResult) {
        throw new Error(`Profile not found for user ${email}: ${profileError?.message || 'No profile data'}`);
      }
      
      profileData = profileResult;
    }

    // User and profile found
    const profileId = profileData.id;

    // Delete in cascade order (foreign key dependencies)
    // 1. Delete training analytics (via dogs cascade)
    // 2. Delete sessions (via dogs cascade) 
    // 3. Delete dogs
    const { error: dogsError } = await supabase
      .from('dogs')
      .delete()
      .eq('owner_id', profileId);

    if (dogsError) throw dogsError;

    // 4. Delete client notes
    const { error: notesError } = await supabase
      .from('client_notes')
      .delete()
      .eq('profile_id', profileId);

    if (notesError) throw notesError;

    // 5. Delete messages (both sent and received)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .or(`recipient_id.eq.${profileId},sender_id.eq.${profileId}`);

    if (messagesError) throw messagesError;

    // 6. Delete message read receipts
    const { error: receiptsError } = await supabase
      .from('message_read_receipts')
      .delete()
      .eq('user_id', userData.id);

    if (receiptsError) throw receiptsError;

    // 7. Delete referrals
    const { error: referralsError } = await supabase
      .from('referrals')
      .delete()
      .eq('referrer_id', profileId);

    if (referralsError) throw referralsError;

    // 8. Delete payments
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('profile_id', profileId);

    if (paymentsError) throw paymentsError;

    // 9. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (profileError) throw profileError;

    // 10. Delete user record
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userData.id);

    if (userDeleteError) throw userDeleteError;

    // 11. Delete from Supabase Auth via Edge Function
    // The admin API requires service role key, so we call our Edge Function
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/delete-auth-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id }),
        });

        const result = await response.json();

        if (!response.ok && !result.message?.includes('not found')) {
          console.warn('Could not delete auth user:', result.error);
        } else {
          console.log('Auth user deleted successfully');
        }
      } else {
        console.warn('No session available to delete auth user');
      }
    } catch (authError) {
      console.warn('Could not delete auth user:', authError);
      // Continue - the public.users record is already deleted
    }

    return { success: true };
  }),
  
  // System settings
  getSettings: withErrorHandling('db.getSettings', () => 
    supabase.from('system_settings').select('*')),
  updateSetting: withErrorHandling('db.updateSetting', (key, value) => 
    supabase.from('system_settings').update({ setting_value: value }).eq('setting_key', key)),
    
  // Client Notes
  getClientNotes: withErrorHandling('db.getClientNotes', (profileId) => 
    supabase.from('client_notes').select(`
      id,
      profile_id,
      title,
      content,
      note_type,
      is_important,
      created_by,
      created_at,
      updated_at,
      users!created_by(email)
    `).eq('profile_id', profileId).order('created_at', { ascending: false })),
  createClientNote: withErrorHandling('db.createClientNote', (data) => 
    supabase.from('client_notes').insert([data])),
  updateClientNote: withErrorHandling('db.updateClientNote', (id, updates) => 
    supabase.from('client_notes').update(updates).eq('id', id)),
  deleteClientNote: withErrorHandling('db.deleteClientNote', (id) => 
    supabase.from('client_notes').delete().eq('id', id))
}