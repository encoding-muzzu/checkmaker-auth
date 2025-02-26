import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DBOPS_API_BASE_URL = 'https://hdfcprepaid-uat-workflow.m2pfintech.dev/core/api/v2/workflows'
const DBOPS_API_TOKEN = Deno.env.get('DBOPS_API_TOKEN')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl!, supabaseServiceRole!)

    // Subscribe to realtime changes on applications table
    const changes = await supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
        },
        async (payload: any) => {
          console.log('Change received:', payload)
          const { old_record, new_record } = payload

          // Only process if status is changing to 2 (checker approval)
          if ((old_record.status_id === 1 || old_record.status_id === 4) && new_record.status_id === 2) {
            const endpoint = old_record.status_id === 1 ? 'approveDBOps' : 'rejectDBOps'
            const url = `${DBOPS_API_BASE_URL}/${endpoint}?version=2&isBuilderFlow=false&isPublic=false`
            
            console.log(`Calling ${endpoint} API at URL: ${url}`)

            try {
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${DBOPS_API_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  applicationNumber: new_record.application_number,
                  kitNo: new_record.kit_no,
                  lrsValue: new_record.lrs_amount_consumed,
                  itrFlag: new_record.itr_flag
                })
              })

              console.log(`API Response status: ${response.status}`)
              const result = await response.json()
              console.log('API Response:', result)

              if (!response.ok) {
                throw new Error(`API call failed: ${JSON.stringify(result)}`)
              }

              console.log(`Successfully processed ${endpoint} for application ${new_record.application_number}`)
            } catch (error) {
              console.error('Error calling DBOps API:', error)
              // Log the error but don't throw to keep the subscription alive
            }
          }
        }
      )
      .subscribe()

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Successfully subscribed to application changes" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in process-dbops function:', error)
    
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
