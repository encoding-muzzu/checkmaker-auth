
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DBOPS_API_BASE_URL = 'https://hdfcprepaid-uat-workflow.m2pfintech.dev/core/api/v2/workflows'
const DBOPS_API_TOKEN = Deno.env.get('DBOPS_API_TOKEN')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { application_number, kit_no, lrs_value, itr_flag, old_status, new_status } = await req.json()
    
    console.log('Received request:', {
      application_number,
      kit_no,
      lrs_value,
      itr_flag,
      old_status,
      new_status
    })

    // Only process if status is changing to 2 (checker approval)
    if ((old_status === 1 || old_status === 4) && new_status === 2) {
      // Always use approveDBOps when checker is approving, regardless of old status
      const endpoint = 'approveDBOps'
      const url = `${DBOPS_API_BASE_URL}/${endpoint}?version=2&isBuilderFlow=false&isPublic=false`
      
      console.log(`Calling ${endpoint} API at URL: ${url}`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${DBOPS_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationNumber: application_number,
          kitNo: kit_no,
          lrsValue: lrs_value,
          itrFlag: itr_flag
        })
      })

      console.log(`API Response status: ${response.status}`)
      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok || (result.data?.status === 'Failure')) {
        let errorMessage = 'API call failed';
        
        if (result.data?.message) {
          try {
            const parsedMessage = JSON.parse(result.data.message);
            errorMessage = parsedMessage.title || parsedMessage.detail || errorMessage;
          } catch {
            errorMessage = result.data.message;
          }
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        throw new Error(errorMessage);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          data: result,
          message: `Successfully processed ${endpoint} for application ${application_number}`
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "No action needed for this status change" 
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
