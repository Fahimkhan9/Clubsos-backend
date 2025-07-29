import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const { error } = await resend.emails.send({
      from: 'ClubOS <onboarding@resend.dev>', // Use a verified domain or resend's domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error("Failed to send email");
    }
  } catch (err) {
    console.error("Resend sendEmail exception:", err);
    throw new Error("Failed to send email");
  }
};
