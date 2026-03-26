"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";

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

    if (!stripe || !elements) {
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-md bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      <p className="text-center text-xs text-gray-500">
        🔒 Secured by Stripe. Your payment information is encrypted and secure.
      </p>
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
        colorPrimary: "#2563eb",
      },
    },
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-black">
        Complete Payment
      </h2>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          clientSecret={clientSecret}
          appointmentId={appointmentId}
          bookingReference={bookingReference}
        />
      </Elements>
    </div>
  );
}
