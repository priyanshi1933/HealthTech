import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import nodemailer from "nodemailer";

console.log("ETHEREAL_USER:", process.env.ETHEREAL_USER);

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter error:", err);
  } else {
    console.log("✅ Email transporter ready");
    console.log("📬 Inbox: https://ethereal.email/messages");
    console.log("   Login with:", process.env.ETHEREAL_USER);
  }
});

const bookingConfirmationTemplate = (data: {
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  timezone: string;
  duration: number;
  fee: number;
  paymentId: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 1.5rem; font-weight: 800; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 0.95rem; }
    .body { padding: 32px; }
    .greeting { font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .subtitle { color: #475569; margin-bottom: 20px; font-size: 0.92rem; }
    .card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #1e293b; font-weight: 700; text-align: right; }
    .payment-box { background: #d1fae5; border-radius: 10px; padding: 14px 20px; margin: 16px 0; }
    .payment-box p { margin: 0; color: #065f46; font-size: 0.88rem; font-weight: 600; }
    .note { color: #64748b; font-size: 0.85rem; line-height: 1.6; margin-top: 16px; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Appointment Confirmed!</h1>
      <p>Your healthcare appointment is successfully booked</p>
    </div>
    <div class="body">
      <p class="greeting">Hello ${data.patientName},</p>
      <p class="subtitle">Your appointment has been confirmed and payment received.</p>
      <div class="card">
        <div class="row"><span class="label">👨‍⚕️ Doctor</span><span class="value">${data.doctorName}</span></div>
        <div class="row"><span class="label">🏥 Specialty</span><span class="value">${data.specialty}</span></div>
        <div class="row"><span class="label">📅 Date</span><span class="value">${data.date}</span></div>
        <div class="row"><span class="label">⏰ Time</span><span class="value">${data.time} (${data.timezone})</span></div>
        <div class="row"><span class="label">⏱ Duration</span><span class="value">${data.duration} minutes</span></div>
        <div class="row"><span class="label">💰 Fee Paid</span><span class="value" style="color:#2563eb;">₹${data.fee}</span></div>
      </div>
      <div class="payment-box">
        <p>✅ Payment Successful &nbsp;|&nbsp; ID: ${data.paymentId}</p>
      </div>
      <p class="note">Please be available 5 minutes before your scheduled time. You will receive a reminder 15 minutes before your consultation.</p>
    </div>
    <div class="footer">
      <p>© 2026 HealthCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const cancellationTemplate = (data: {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  fee: number;
  cancelledBy: string;
  reason: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 1.5rem; font-weight: 800; }
    .body { padding: 32px; }
    .greeting { font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .subtitle { color: #475569; margin-bottom: 20px; font-size: 0.92rem; }
    .card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #1e293b; font-weight: 700; text-align: right; }
    .refund-box { background: #f3e8ff; border-radius: 10px; padding: 14px 20px; margin: 16px 0; }
    .refund-box p { margin: 0; color: #6b21a8; font-size: 0.88rem; font-weight: 600; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>❌ Appointment Cancelled</h1></div>
    <div class="body">
      <p class="greeting">Hello ${data.patientName},</p>
      <p class="subtitle">Your appointment has been cancelled.</p>
      <div class="card">
        <div class="row"><span class="label">👨‍⚕️ Doctor</span><span class="value">${data.doctorName}</span></div>
        <div class="row"><span class="label">📅 Date</span><span class="value">${data.date}</span></div>
        <div class="row"><span class="label">⏰ Time</span><span class="value">${data.time}</span></div>
        <div class="row"><span class="label">❌ Cancelled By</span><span class="value" style="text-transform:capitalize;">${data.cancelledBy}</span></div>
        <div class="row"><span class="label">📝 Reason</span><span class="value">${data.reason}</span></div>
        <div class="row"><span class="label">💰 Refund</span><span class="value" style="color:#6b21a8;">₹${data.fee}</span></div>
      </div>
      <div class="refund-box">
        <p>💜 Refund Initiated &nbsp;|&nbsp; ₹${data.fee} within 3-5 business days.</p>
      </div>
    </div>
    <div class="footer"><p>© 2026 HealthCare Platform. All rights reserved.</p></div>
  </div>
</body>
</html>
`;

const reminderTemplate = (data: {
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  timezone: string;
  duration: number;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 1.5rem; font-weight: 800; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .body { padding: 32px; }
    .card { background: #fffbeb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fde68a; font-size: 0.9rem; }
    .row:last-child { border-bottom: none; }
    .label { color: #92400e; font-weight: 600; }
    .value { color: #1e293b; font-weight: 700; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Appointment Reminder</h1>
      <p>Your appointment starts in 15 minutes!</p>
    </div>
    <div class="body">
      <p style="font-size:1.1rem;font-weight:600;color:#1e293b;">Hello ${data.patientName},</p>
      <p style="color:#475569;">Your appointment is starting soon. Please be ready!</p>
      <div class="card">
        <div class="row"><span class="label">👨‍⚕️ Doctor</span><span class="value">${data.doctorName}</span></div>
        <div class="row"><span class="label">🏥 Specialty</span><span class="value">${data.specialty}</span></div>
        <div class="row"><span class="label">📅 Date</span><span class="value">${data.date}</span></div>
        <div class="row"><span class="label">⏰ Time</span><span class="value">${data.time} (${data.timezone})</span></div>
        <div class="row"><span class="label">⏱ Duration</span><span class="value">${data.duration} minutes</span></div>
      </div>
    </div>
    <div class="footer"><p>© 2026 HealthCare Platform. All rights reserved.</p></div>
  </div>
</body>
</html>
`;

export const sendBookingConfirmation = async (
  to: string,
  data: Parameters<typeof bookingConfirmationTemplate>[0],
): Promise<string | null> => {
  try {
    const info = await transporter.sendMail({
      from: '"HealthCare Platform" <noreply@healthcare.com>',
      to,
      subject: "✅ Appointment Confirmed - HealthCare Platform",
      html: bookingConfirmationTemplate(data),
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) as string;
    console.log("─────────────────────────────────────");
    console.log("📧 Booking confirmation sent!");
    console.log("🔗 Preview:", previewUrl);
    console.log("─────────────────────────────────────");
    return previewUrl;
  } catch (err) {
    console.error("❌ Booking email failed:", err);
    return null;
  }
};

export const sendCancellationEmail = async (
  to: string,
  data: Parameters<typeof cancellationTemplate>[0],
): Promise<string | null> => {
  try {
    const info = await transporter.sendMail({
      from: '"HealthCare Platform" <noreply@healthcare.com>',
      to,
      subject: "❌ Appointment Cancelled - HealthCare Platform",
      html: cancellationTemplate(data),
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) as string;
    console.log("─────────────────────────────────────");
    console.log("📧 Cancellation email sent!");
    console.log("🔗 Preview:", previewUrl);
    console.log("─────────────────────────────────────");
    return previewUrl;
  } catch (err) {
    console.error("❌ Cancellation email failed:", err);
    return null;
  }
};

export const sendReminderEmail = async (
  to: string,
  data: Parameters<typeof reminderTemplate>[0],
): Promise<string | null> => {
  try {
    const info = await transporter.sendMail({
      from: '"HealthCare Platform" <noreply@healthcare.com>',
      to,
      subject: "⏰ Reminder: Appointment in 15 Minutes",
      html: reminderTemplate(data),
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) as string;
    console.log("─────────────────────────────────────");
    console.log("📧 Reminder email sent!");
    console.log("🔗 Preview:", previewUrl);
    console.log("─────────────────────────────────────");
    return previewUrl;
  } catch (err) {
    console.error("❌ Reminder email failed:", err);
    return null;
  }
};
