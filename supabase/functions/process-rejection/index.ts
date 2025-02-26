
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get request payload
    const { application_number, comment } = await req.json()

    console.log('Processing rejection for:', { application_number, comment })

    // Find the application record
    const { data: application, error: applicationError } = await supabaseClient
      .from('applications')
      .select('id')
      .eq('application_number', application_number)
      .single()

    if (applicationError || !application) {
      console.error('Error finding application:', applicationError)
      throw new Error(`Application not found with number: ${application_number}`)
    }

    // Insert comment
    const { error: commentError } = await supabaseClient
      .from('application_comments')
      .insert([
        {
          application_id: application.id,
          comment: comment,
          type: 'rejection'
        }
      ])

    if (commentError) {
      console.error('Error inserting comment:', commentError)
      throw new Error('Failed to insert comment')
    }

    // Update application status
    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({ status_id: 2 })
      .eq('application_number', application_number)

    if (updateError) {
      console.error('Error updating application:', updateError)
      throw new Error('Failed to update application status')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed rejection for application ${application_number}`
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in process-rejection function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
