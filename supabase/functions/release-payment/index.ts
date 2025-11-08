import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReleaseRequest {
  rentalId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { rentalId }: ReleaseRequest = await req.json();

    console.log('Releasing payment for rental:', { rentalId, userId: user.id });

    // Get payment record
    const { data: payment, error: fetchError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('rental_id', rentalId)
      .eq('user_id', user.id)
      .eq('status', 'captured')
      .single();

    if (fetchError || !payment) {
      throw new Error('Payment not found or already released');
    }

    // Update payment status to released
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Database error:', updateError);
      throw updateError;
    }

    console.log('Payment released successfully:', payment.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment released successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in release-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
