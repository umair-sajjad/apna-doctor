import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials are not configured");
    }

    // Format phone number for Pakistan
    let phoneNumber = options.to;
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "+92" + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+92" + phoneNumber;
    }

    console.log("Sending SMS to:", phoneNumber);

    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log("SMS sent successfully:", message.sid);
    return { success: true, id: message.sid };
  } catch (error) {
    console.error("SMS service error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
