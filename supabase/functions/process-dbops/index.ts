
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DBOPS_API_BASE_URL = 'https://hdfcprepaid-uat-workflow.m2pfintech.dev/core/api/v2/workflows'
const DBOPS_API_TOKEN = Deno.env.get('DBOPS_API_TOKEN')

interface QueueItem {
  id: string
  application_id: string
  old_status: number
  new_status: number
  application_number: string
  kit_no: string
  lrs_amount_consumed: number
  itr_flag: string
  retries: number
}

async function processQueueItem(item: QueueItem) {
  const { old_status, new_status } = item
  let endpoint = ''

  if (old_status === 1 && new_status === 2) {
    endpoint = 'approveDBOps'
  } else if (old_status === 4 && new_status === 2) {
    endpoint = 'rejectDBOps'
  } else {
    console.error(`Invalid status transition: ${old_status} -> ${new_status}`)
    return false
  }

  const url = `${DBOPS_API_BASE_URL}/${endpoint}?version=2&isBuilderFlow=false&isPublic=false`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${DBOPS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationNumber: item.application_number,
        kitNo: item.kit_no,
        lrsValue: item.lrs_amount_consumed,
        itrFlag: item.itr_flag
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error calling DBOps API:', error)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get unprocessed queue items
    const { data: queueItems, error: fetchError } = await supabaseClient
      .from('application_status_queue')
      .select('*')
      .is('processed_at', null)
      .lt('retries', 3)
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      throw fetchError
    }

    console.log(`Processing ${queueItems?.length || 0} queue items`)

    // Process each queue item
    for (const item of queueItems || []) {
      console.log(`Processing queue item ${item.id}`)
      
      const success = await processQueueItem(item)

      if (success) {
        // Mark as processed
        await supabaseClient
          .from('application_status_queue')
          .update({
            processed_at: new Date().toISOString(),
          })
          .eq('id', item.id)
      } else {
        // Increment retry count
        await supabaseClient
          .from('application_status_queue')
          .update({
            retries: item.retries + 1,
            error: 'Failed to process item'
          })
          .eq('id', item.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: queueItems?.length || 0 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
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
