import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export async function createPaymentIntent(
  amount: number,
  appointmentId: string,
  metadata: {
    patientName: string;
    patientEmail: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
  }
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "pkr",
    metadata: {
      appointmentId,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}
