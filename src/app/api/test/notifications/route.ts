import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifications/email";
import { sendSMS } from "@/lib/notifications/sms";

export async function POST(request: NextRequest) {
  // Protect this endpoint in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, to, message } = body;

    if (type === "email") {
      const result = await sendEmail({
        to,
        subject: "Test Email from ApnaDoctor",
        html: `<h1>Test Email</h1><p>${message}</p>`,
        text: message,
      });
      return NextResponse.json(result);
    }

    if (type === "sms") {
      const result = await sendSMS({ to, message });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
