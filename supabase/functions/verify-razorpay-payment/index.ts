import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: VerifyRequest = await req.json();

    console.log('Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id });

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(razorpayKeySecret);
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValidSignature = expectedSignature === razorpay_signature;

    if (!isValidSignature) {
      console.error('Invalid signature');
      throw new Error('Payment verification failed: Invalid signature');
    }

    console.log('Payment signature verified successfully');

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
        payment_method: 'razorpay',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment verified successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-razorpay-payment:', error);
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
