// Edge Function to send scheduled messages
// This function is called by Supabase Cron to process scheduled messages

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting scheduled message processing...')

    // Get all scheduled messages that are ready to be sent
    const { data: scheduledMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'scheduled')
      .not('scheduled_for', 'is', null)
      .lte('scheduled_for', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled messages:', fetchError)
      throw fetchError
    }

    if (!scheduledMessages || scheduledMessages.length === 0) {
      console.log('No scheduled messages ready to send')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No scheduled messages to process',
          processedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${scheduledMessages.length} scheduled messages to process`)

    // Update all scheduled messages to 'sent' status
    const messageIds = scheduledMessages.map(msg => msg.id)
    
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        status: 'sent',
        // Update the actual sent time to now
        created_at: new Date().toISOString()
      })
      .in('id', messageIds)

    if (updateError) {
      console.error('Error updating message status:', updateError)
      throw updateError
    }

    console.log(`Successfully sent ${scheduledMessages.length} scheduled messages`)

    // Log details of processed messages for debugging
    const messageDetails = scheduledMessages.map(msg => ({
      id: msg.id,
      recipient_id: msg.recipient_id,
      subject: msg.subject,
      scheduled_for: msg.scheduled_for,
      message_type: msg.message_type
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully sent ${scheduledMessages.length} scheduled messages`,
        processedCount: scheduledMessages.length,
        messages: messageDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-scheduled-messages function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/* To deploy this function:
1. Run: supabase functions deploy send-scheduled-messages
2. Set up the cron job to call this function every minute
*/