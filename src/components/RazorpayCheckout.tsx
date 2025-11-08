import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RazorpayCheckoutProps {
  amount: number;
  rentalId: string;
  onSuccess: () => void;
  onFailure: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayCheckout = ({ amount, rentalId, onSuccess, onFailure }: RazorpayCheckoutProps) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            amount,
            rentalId,
            currency: 'INR',
          },
        }
      );

      if (orderError) throw orderError;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Rentify',
        description: 'Rental Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }
            );

            if (verifyError) {
              throw verifyError;
            }

            toast({
              title: 'Payment Successful',
              description: 'Your rental has been confirmed!',
            });
            
            onSuccess();
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: error.message || 'Please contact support',
              variant: 'destructive',
            });
            onFailure();
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment',
              variant: 'destructive',
            });
            onFailure();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Unable to process payment',
        variant: 'destructive',
      });
      onFailure();
    }
  };

  return null; // This component doesn't render anything, it just handles payment logic
};

export const initiateRazorpayPayment = async (
  amount: number,
  rentalId: string,
  onSuccess: () => void,
  onFailure: () => void
) => {
  try {
    // Create order
    const { data: orderData, error: orderError } = await supabase.functions.invoke(
      'create-razorpay-order',
      {
        body: {
          amount,
          rentalId,
          currency: 'INR',
        },
      }
    );

    if (orderError) throw orderError;

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Rentify',
      description: 'Rental Payment',
      order_id: orderData.orderId,
      handler: async function (response: any) {
        try {
          // Verify payment
          const { error: verifyError } = await supabase.functions.invoke(
            'verify-razorpay-payment',
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            }
          );

          if (verifyError) {
            throw verifyError;
          }

          toast({
            title: 'Payment Successful',
            description: 'Your rental has been confirmed!',
          });
          
          onSuccess();
        } catch (error: any) {
          console.error('Payment verification error:', error);
          toast({
            title: 'Payment Verification Failed',
            description: error.message || 'Please contact support',
            variant: 'destructive',
          });
          onFailure();
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function() {
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment',
            variant: 'destructive',
          });
          onFailure();
        }
      }
    };

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error: any) {
    console.error('Payment error:', error);
    toast({
      title: 'Payment Failed',
      description: error.message || 'Unable to process payment',
      variant: 'destructive',
    });
    onFailure();
  }
};
