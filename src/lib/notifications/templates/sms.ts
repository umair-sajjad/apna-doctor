export function appointmentConfirmationSMS(data: {
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  bookingReference: string;
}) {
  return `ApnaDoctor: Appointment confirmed with Dr. ${data.doctorName} on ${data.appointmentDate} at ${data.appointmentTime}. Clinic: ${data.clinicName}. Ref: ${data.bookingReference}`;
}

export function appointmentReminderSMS(
  data: {
    doctorName: string;
    appointmentTime: string;
    clinicAddress: string;
  },
  hoursUntil: number
) {
  if (hoursUntil === 0) {
    return `ApnaDoctor: Your appointment with Dr. ${data.doctorName} is NOW at ${data.appointmentTime}. Location: ${data.clinicAddress}`;
  }
  return `ApnaDoctor: Reminder - Your appointment with Dr. ${data.doctorName} is in ${hoursUntil} hours (${data.appointmentTime}). Please arrive 10 min early.`;
}

export function appointmentCancelledSMS(data: {
  doctorName: string;
  refundAmount: number;
}) {
  return `ApnaDoctor: Your appointment with Dr. ${data.doctorName} has been cancelled. Refund of PKR ${data.refundAmount} will be processed in 3-5 days.`;
}
