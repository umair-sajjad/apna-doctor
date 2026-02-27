interface AppointmentConfirmationData {
  patientName: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  clinicAddress: string;
  bookingReference: string;
  consultationFee: number;
}

export function appointmentConfirmationEmail(
  data: AppointmentConfirmationData
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">ApnaDoctor</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">Your Health, Our Priority</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="background-color: #dcfce7; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 20px 0 10px 0; color: #111827; font-size: 24px;">Appointment Confirmed!</h2>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Your booking has been confirmed successfully</p>
            </td>
          </tr>

          <!-- Appointment Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Booking Reference</span><br>
                    <strong style="color: #111827; font-size: 18px;">${data.bookingReference}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Doctor</span><br>
                    <strong style="color: #111827; font-size: 16px;">Dr. ${data.doctorName}</strong><br>
                    <span style="color: #6b7280; font-size: 13px;">${data.specialization}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Date & Time</span><br>
                    <strong style="color: #111827; font-size: 16px;">${data.appointmentDate}</strong><br>
                    <strong style="color: #2563eb; font-size: 16px;">${data.appointmentTime}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Clinic</span><br>
                    <strong style="color: #111827; font-size: 16px;">${data.clinicName}</strong><br>
                    <span style="color: #6b7280; font-size: 13px;">${data.clinicAddress}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Consultation Fee</span><br>
                    <strong style="color: #16a34a; font-size: 18px;">PKR ${data.consultationFee}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                <strong style="color: #92400e; font-size: 14px;">⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 13px;">
                  <li>Please arrive 10 minutes early</li>
                  <li>Bring your ID and any previous medical records</li>
                  <li>You'll receive SMS reminders before your appointment</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                Need help? Contact us at <a href="mailto:support@apnadoctor.com" style="color: #2563eb; text-decoration: none;">support@apnadoctor.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ApnaDoctor. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Appointment Confirmed!

Your booking has been confirmed successfully.

Booking Reference: ${data.bookingReference}

Doctor: Dr. ${data.doctorName}
Specialization: ${data.specialization}

Date & Time: ${data.appointmentDate} at ${data.appointmentTime}

Clinic: ${data.clinicName}
Address: ${data.clinicAddress}

Consultation Fee: PKR ${data.consultationFee}

Important:
- Please arrive 10 minutes early
- Bring your ID and any previous medical records
- You'll receive SMS reminders before your appointment

Need help? Contact us at support@apnadoctor.com

© ${new Date().getFullYear()} ApnaDoctor. All rights reserved.
  `;

  return { html, text };
}

interface ReminderData {
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  clinicName: string;
  clinicAddress: string;
}

export function appointmentReminderEmail(
  data: ReminderData,
  hoursUntil: number
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🔔 Appointment Reminder</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px;">
                Hi ${data.patientName},
              </p>
              <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px;">
                ${hoursUntil === 0 ? "Your appointment is NOW!" : `This is a reminder that your appointment with Dr. ${data.doctorName} is in ${hoursUntil} hours.`}
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <strong style="color: #111827;">Time:</strong> ${data.appointmentTime}<br>
                    <strong style="color: #111827;">Doctor:</strong> Dr. ${data.doctorName}<br>
                    <strong style="color: #111827;">Clinic:</strong> ${data.clinicName}<br>
                    <span style="color: #6b7280; font-size: 14px;">${data.clinicAddress}</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #6b7280; font-size: 14px;">
                Please arrive 10 minutes early. If you need to reschedule, please contact us immediately.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} ApnaDoctor</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return {
    html,
    text: `Reminder: Your appointment with Dr. ${data.doctorName} is ${hoursUntil === 0 ? "NOW" : `in ${hoursUntil} hours`}!`,
  };
}
