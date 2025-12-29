import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Contact submissions and client conversions
export const contacts = {
  createContactSubmission: withErrorHandling('db.createContactSubmission', (data) => 
    supabase.from('contact_submissions').insert([data])),
    
  getContactSubmissions: withErrorHandling('db.getContactSubmissions', () => 
    supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })),
    
  getContactSubmissionByEmail: withErrorHandling('db.getContactSubmissionByEmail', async (email) => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // Return the first item or null if no results
    return { data: data?.[0] || null, error: null };
  }),
  
  // Check if a contact submission has an associated client profile
  checkContactHasClientProfile: withErrorHandling('db.checkContactHasClientProfile', async (submissionId) => {
    // First get the contact submission to check if assigned_profile_id exists
    const { data: submission, error: submissionError } = await supabase
      .from('contact_submissions')
      .select('assigned_profile_id, email')
      .eq('id', submissionId)
      .single();

    if (submissionError) throw submissionError;

    // If there's an assigned profile ID, check if that profile still exists and is active
    if (submission.assigned_profile_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, is_active')
        .eq('id', submission.assigned_profile_id)
        .eq('is_active', true)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        // Don't throw for missing profile, just return no profile
        console.warn('Profile lookup error:', profileError);
      }

      return {
        data: {
          hasProfile: !!profile,
          profileData: profile || null,
          submissionEmail: submission.email
        },
        error: null
      };
    }

    // If no assigned_profile_id, try to check if there's a user with the same email
    // But handle this more gracefully to avoid 406 errors
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, is_active')
        .eq('is_active', true);
      
      if (!profileError && profiles) {
        // Now check if any profile has a matching email in the users table
        for (const profile of profiles) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, is_active')
            .eq('id', profile.user_id)
            .eq('email', submission.email)
            .single();
          
          if (!userError && user) {
            return {
              data: {
                hasProfile: true,
                profileData: {
                  id: profile.id,
                  user_id: user.id,
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  users: { email: user.email, is_active: user.is_active }
                },
                submissionEmail: submission.email
              },
              error: null
            };
          }
        }
      }
    } catch (err) {
      console.warn('Error checking for existing user:', err);
    }

    // No profile found
    return {
      data: {
        hasProfile: false,
        profileData: null,
        submissionEmail: submission.email
      },
      error: null
    };
  }),
  
  updateContactSubmission: withErrorHandling('db.updateContactSubmission', (id, updates) => 
    supabase.from('contact_submissions').update(updates).eq('id', id)),
    
  deleteContactSubmissions: withErrorHandling('db.deleteContactSubmissions', (ids) => 
    supabase.from('contact_submissions').delete().in('id', ids)),

  // Convert contact submission to client (immediately creates user account and profile)
  convertContactToClient: withErrorHandling('db.convertContactToClient', async (submissionId) => {
    // Get the contact submission data
    const { data: submission, error: submissionError } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError) throw submissionError;

    // Check if this contact submission is already converted
    if (submission.status === 'converted' && submission.assigned_profile_id) {
      throw new Error('This contact submission has already been converted to a client');
    }

    // Generate a temporary password (will be sent to the user)
    const tempPassword = `Welcome${Math.random().toString(36).substring(2, 10)}!`;

    let userId;

    // Create auth user via Edge Function (uses service role key securely)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('You must be logged in as an admin to convert contacts to clients');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/create-auth-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: submission.email,
        password: tempPassword,
        userMetadata: {
          role: 'client',
          created_from_contact_form: true
        }
      }),
    });

    const result = await response.json();

    if (!response.ok && !result.alreadyExists) {
      throw new Error(result.error || 'Failed to create auth user');
    }

    // Handle case where user already exists in auth
    if (result.alreadyExists && result.user) {
      userId = result.user.id;

      // Check if there's already a profile for this user
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile && !profileCheckError) {
        // Update the contact submission to link to existing profile
        await supabase
          .from('contact_submissions')
          .update({
            assigned_profile_id: existingProfile.id,
            status: 'converted'
          })
          .eq('id', submissionId);

        throw new Error(`A client account already exists for ${submission.email}. The contact submission has been linked to the existing profile.`);
      }
      // If no profile exists, continue to create one for this existing auth user
    } else {
      userId = result.user?.id;
    }

    if (!userId) {
      throw new Error('Failed to get user ID from auth creation');
    }

    // Wait a moment for any database triggers to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create or update the user record
    const { error: userError } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        email: submission.email,
        role: 'client',
        is_active: true
      }], { onConflict: 'id' }); // Changed to id conflict to avoid email duplicates

    if (userError) {
      console.error('Error creating user record:', userError);
      // Continue anyway - the trigger might have created it
    }
    
    // Check if profile already exists for this user
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile && !profileCheckError) {
      // Profile exists but may have been created by trigger with default values
      // Update it with the contact submission data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: submission.first_name,
          last_name: submission.last_name,
          phone: submission.phone,
          created_from_contact_form: true,
          how_heard_about_us: 'Contact Form',
          onboarding_data: {
            personalInfo: {
              firstName: submission.first_name,
              lastName: submission.last_name,
              email: submission.email,
              phone: submission.phone || '',
              address: '',
              emergencyContact: '',
              emergencyPhone: ''
            },
            dogInfo: submission.dog_name ? {
              dogs: [{
                name: submission.dog_name,
                breed: submission.dog_breed || 'Unknown',
                birthDate: submission.dog_birth_date || '',
                sex: '',
                spayedNeutered: false,
                weight: '',
                medicalConditions: '',
                medications: '',
                behavioralNotes: '',
                trainingGoals: ''
              }]
            } : { dogs: [] },
            trainingInfo: {
              previousTraining: '',
              trainingGoals: submission.message || '',
              specificIssues: '',
              howHeardAboutUs: 'Contact Form'
            }
          },
          notes: `Converted from contact form submission on ${new Date(submission.created_at).toLocaleDateString()}.\nOriginal message: ${submission.message}`
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
      
      // Update the contact submission
      await supabase
        .from('contact_submissions')
        .update({ 
          assigned_profile_id: existingProfile.id,
          status: 'converted'
        })
        .eq('id', submissionId);
        
      // Create dog if provided
      if (submission.dog_name) {
        const { error: dogError } = await supabase
          .from('dogs')
          .insert([{
            owner_id: existingProfile.id,
            name: submission.dog_name,
            breed: submission.dog_breed || 'Unknown',
            birth_date: submission.dog_birth_date || null,
            sex: null,
            behavioral_notes: submission.message ? `Initial inquiry: ${submission.message}` : null,
            training_goals: submission.message || null
          }]);

        if (dogError) {
          console.error('Error creating dog record:', dogError);
        }
      }
        
      return {
        userId,
        profileId: existingProfile.id,
        email: submission.email,
        tempPassword: tempPassword, // Return the temp password for new users
        loginUrl: `${window.location.origin}/login`,
        profileData: updatedProfile || existingProfile,
        submissionData: submission,
        message: `Client account created and updated with contact submission data for ${submission.email}`
      };
    }

    // Create the profile with incomplete status and pre-filled onboarding data
    const onboardingData = {
      personalInfo: {
        firstName: submission.first_name,
        lastName: submission.last_name,
        email: submission.email,
        phone: submission.phone || '',
        address: '',
        emergencyContact: '',
        emergencyPhone: ''
      },
      dogInfo: submission.dog_name ? {
        dogs: [{
          name: submission.dog_name,
          breed: submission.dog_breed || 'Unknown',
          birthDate: submission.dog_birth_date || '',
          sex: '',
          spayedNeutered: false,
          weight: '',
          medicalConditions: '',
          medications: '',
          behavioralNotes: '',
          trainingGoals: ''
        }]
      } : { dogs: [] },
      trainingInfo: {
        previousTraining: '',
        trainingGoals: submission.message || '',
        specificIssues: '',
        howHeardAboutUs: 'Contact Form'
      }
    };

    // Only create profile if it doesn't exist
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        user_id: userId,
        role: 'client',
        first_name: submission.first_name,
        last_name: submission.last_name,
        phone: submission.phone,
        created_from_contact_form: true,
        profile_completed: false, // Mark as incomplete
        onboarding_step: 0, // Start at step 0
        onboarding_data: onboardingData, // Pre-fill with contact submission data
        is_active: true,
        how_heard_about_us: 'Contact Form',
        notes: `Converted from contact form submission on ${new Date(submission.created_at).toLocaleDateString()}.\nOriginal message: ${submission.message}`
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    // Update the contact submission with the assigned profile ID
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ 
        assigned_profile_id: profileData.id,
        status: 'converted'
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    // If dog information was provided, create the dog record with all available info
    if (submission.dog_name) {
      const { error: dogError } = await supabase
        .from('dogs')
        .insert([{
          owner_id: profileData.id,
          name: submission.dog_name,
          breed: submission.dog_breed || 'Unknown',
          birth_date: submission.dog_birth_date || null,
          sex: null, // Default to null since it's not in contact submission
          behavioral_notes: submission.message ? `Initial inquiry: ${submission.message}` : null,
          training_goals: submission.message || null
        }]);

      if (dogError) {
        console.error('Error creating dog record:', dogError);
        // Don't throw - this is not critical
      }
    }

    // Create the login URL
    const origin = (typeof window !== 'undefined' && window.location) 
      ? window.location.origin 
      : 'https://your-domain.com';
    const loginUrl = `${origin}/login`;

    // Client account created successfully

    return { 
      userId,
      profileId: profileData.id,
      email: submission.email,
      tempPassword, // Return this so admin can share it with the client
      loginUrl,
      profileData,
      submissionData: submission,
      message: `Client account created successfully. Temporary password: ${tempPassword}`
    };
  }),
  
  // Signup Invitations
  createSignupInvitation: withErrorHandling('db.createSignupInvitation', (data) => 
    supabase.from('signup_invitations').insert([data])),
    
  getSignupInvitation: withErrorHandling('db.getSignupInvitation', (token) => 
    supabase.from('signup_invitations').select(`
      *,
      contact_submissions(
        first_name,
        last_name,
        email,
        phone,
        dog_name,
        dog_breed,
        dog_birth_date,
        message
      )
    `).eq('invitation_token', token).single()),
    
  markInvitationUsed: withErrorHandling('db.markInvitationUsed', (token) => 
    supabase.from('signup_invitations').update({ used_at: new Date().toISOString() }).eq('invitation_token', token)),
    
  getSignupInvitations: withErrorHandling('db.getSignupInvitations', () => 
    supabase.from('signup_invitations').select('*').order('created_at', { ascending: false }))
}