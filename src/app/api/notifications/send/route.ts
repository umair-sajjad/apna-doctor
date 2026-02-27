import { NextRequest, NextResponse } from "next/server";
import {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendCancellationNotification,
} from "@/lib/notifications/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, appointmentId, hoursUntil, refundAmount } = body;

    // Verify API key for security
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let result;

    switch (type) {
      case "confirmation":
        result = await sendAppointmentConfirmation(appointmentId);
        break;

      case "reminder":
        result = await sendAppointmentReminder(appointmentId, hoursUntil || 2);
        break;

      case "cancellation":
        result = await sendCancellationNotification(
          appointmentId,
          refundAmount || 0
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
