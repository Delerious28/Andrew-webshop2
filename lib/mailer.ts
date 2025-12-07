import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMail(options: { to: string; subject: string; html: string }) {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM env var not set');
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    ...options
  });
}
