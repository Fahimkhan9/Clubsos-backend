// utils/sendInviteEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // configure with your SMTP details or service
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendInviteEmail(email, token) {
  const inviteUrl = `${process.env.FRONTEND_URL}/signup?inviteToken=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "You're invited to join a club on ClubOS",
    html: `<p>You have been invited to join a club. Click <a href="${inviteUrl}">here</a> to sign up and join.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
