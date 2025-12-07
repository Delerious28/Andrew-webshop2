import nodemailer from 'nodemailer';
import { emailTemplates } from './emailTemplates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMail(options: { to: string; subject: string; html: string }) {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM env var not set');
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyLink = `${process.env.APP_BASE_URL}/verify?token=${token}`;
  const template = emailTemplates.verificationEmail(name, verifyLink);
  return sendMail({ to: email, ...template });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${token}`;
  const template = emailTemplates.passwordResetEmail(name, resetLink);
  return sendMail({ to: email, ...template });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  items: Array<{ title: string; quantity: number; price: number }>,
  subtotal: number,
  tax: number,
  total: number,
  address: string
) {
  const template = emailTemplates.orderConfirmationEmail(name, orderId, items, subtotal, tax, total, address);
  return sendMail({ to: email, ...template });
}

export async function sendAdminOrderNotification(
  adminEmail: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  items: Array<{ title: string; quantity: number; price: number }>,
  total: number,
  address: string
) {
  const template = emailTemplates.adminOrderNotification(orderId, customerName, customerEmail, items, total, address);
  return sendMail({ to: adminEmail, ...template });
}

export async function sendShippingNotificationEmail(
  email: string,
  name: string,
  orderId: string,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const template = emailTemplates.shippingNotificationEmail(name, orderId, trackingNumber, trackingUrl);
  return sendMail({ to: email, ...template });
}
