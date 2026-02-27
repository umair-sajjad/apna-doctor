import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { data, error } = await resend.emails.send({
      from: "ApnaDoctor <onboarding@resend.dev>", // Use Resend's test domain
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
