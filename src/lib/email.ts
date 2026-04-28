import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendVerificationCode(to: string, code: string) {
  if (!resend) {
    // In development without Resend configured, print to console.
    console.log(`[OfferBoard] Verification code for ${to}: ${code}`);
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "verify@offerboard.app",
    to,
    subject: "Your OfferBoard verification code",
    html: `
      <p>Your one-time verification code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p>
      <p>It expires in 15 minutes. Do not share it with anyone.</p>
      <p style="color:#999;font-size:12px">
        This email will not be stored. Your offer submission is anonymous.
      </p>
    `,
  });
}
