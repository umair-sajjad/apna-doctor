"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  clientSecret: string;
  appointmentId: string;
  bookingReference: string;
}

function PaymentForm({ appointmentId, bookingReference }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?ref=${bookingReference}`,
      },
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Processing…
          </>
        ) : (
          "Pay Now"
        )}
      </button>

      <div className="flex items-center justify-center gap-2">
        <ShieldCheck size={13} className="text-gray-400" />
        <p className="text-xs text-gray-400">
          Secured by Stripe. Your payment information is encrypted.
        </p>
      </div>
    </form>
  );
}

export default function StripePayment({
  clientSecret,
  appointmentId,
  bookingReference,
}: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#1A6FB8",
        colorBackground: "#ffffff",
        colorText: "#1E3A5F",
        borderRadius: "12px",
        fontFamily: "DM Sans, sans-serif",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        appointmentId={appointmentId}
        bookingReference={bookingReference}
      />
    </Elements>
  );
}
