import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  amount: number;
  rentalId: string;
  currency?: string;
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

    const { amount, rentalId, currency = 'INR' }: OrderRequest = await req.json();

    console.log('Creating Razorpay order:', { amount, rentalId, currency, userId: user.id });

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `rcpt_${rentalId}`,
      notes: {
        rental_id: rentalId,
        user_id: user.id,
      },
    };

    const authHeader = `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`;
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error('Razorpay API error:', error);
      throw new Error(`Razorpay API error: ${error}`);
    }

    const order = await razorpayResponse.json();
    console.log('Razorpay order created:', order.id);

    // Store payment record
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        rental_id: rentalId,
        user_id: user.id,
        razorpay_order_id: order.id,
        amount,
        currency,
        status: 'pending',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ 
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in create-razorpay-order:', error);
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
