import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  program: string
  dogName: string
  dogBreed: string
  dogBirthDate: string
  message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { contactData }: { contactData: ContactFormData } = await req.json()

    // Insert contact submission into database
    const { data: submission, error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert([
        {
          first_name: contactData.firstName,
          last_name: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          dog_name: contactData.dogName,
          dog_breed: contactData.dogBreed,
          dog_birth_date: contactData.dogBirthDate,
          message: contactData.message,
          status: 'new'
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    // Create email content
    const emailSubject = `New Training Inquiry: ${contactData.dogName} (${contactData.dogBreed})`
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🐕 New Training Inquiry</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Flores Dog Training</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1e293b; margin-top: 0;">Contact Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Name:</td>
              <td style="padding: 8px 0;">${contactData.firstName} ${contactData.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${contactData.email}" style="color: #3b82f6;">${contactData.email}</a></td>
            </tr>
            ${contactData.phone ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${contactData.phone}" style="color: #3b82f6;">${contactData.phone}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Program:</td>
              <td style="padding: 8px 0;">${contactData.program}</td>
            </tr>
          </table>

          <h2 style="color: #1e293b; margin-top: 30px;">Dog Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Name:</td>
              <td style="padding: 8px 0;">${contactData.dogName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Breed:</td>
              <td style="padding: 8px 0;">${contactData.dogBreed}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Birth Date:</td>
              <td style="padding: 8px 0;">${contactData.dogBirthDate}</td>
            </tr>
          </table>

          ${contactData.message ? `
          <h2 style="color: #1e293b; margin-top: 30px;">Message</h2>
          <div style="background: #f8fafc; border-left: 4px solid #06b6d4; padding: 15px; margin: 10px 0;">
            <p style="margin: 0; line-height: 1.6;">${contactData.message}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              This inquiry was submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
              Submission ID: ${submission.id}
            </p>
          </div>
        </div>
      </div>
    `

    // Send email using Supabase's built-in email service
    // Note: In production, you might want to use a more robust email service like Resend or SendGrid
    console.log('Contact form submission processed successfully:', {
      submissionId: submission.id,
      email: contactData.email,
      dogName: contactData.dogName
    })

    // For now, we'll return success and rely on the database notification
    // You can enhance this later with actual email sending via your preferred provider
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: submission.id,
        message: 'Contact form submitted successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process contact form' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

/* To deploy this function:
1. Install Supabase CLI: npm install -g supabase
2. Login: supabase login
3. Link project: supabase link --project-ref YOUR_PROJECT_REF
4. Deploy: supabase functions deploy send-contact-email
*/