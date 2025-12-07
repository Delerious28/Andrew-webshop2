/**
 * Email configuration and testing utilities
 * This file helps you set up email sending for Remoof
 */

// Setup guides for different email providers:

export const emailProviderSetups = {
  resend: {
    name: 'Resend (Recommended)',
    setupTime: '5 minutes',
    cost: 'Free (up to 100 emails/day)',
    steps: [
      '1. Go to https://resend.com',
      '2. Sign up for free account',
      '3. Verify your domain or use default domain',
      '4. Get API key from dashboard',
      '5. Add to .env.local: RESEND_API_KEY="re_xxx"'
    ],
    implementation: `
      // In lib/mailer.ts, add:
      import { Resend } from 'resend';
      
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      export async function sendMail(options: { to: string; subject: string; html: string }) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: options.to,
          subject: options.subject,
          html: options.html
        });
      }
    `
  },

  gmail: {
    name: 'Gmail SMTP',
    setupTime: '10 minutes',
    cost: 'Free',
    steps: [
      '1. Go to https://myaccount.google.com',
      '2. Enable 2-Factor Authentication',
      '3. Go to Security > App passwords',
      '4. Generate app password for Mail/Windows',
      '5. Copy the 16-character password',
      '6. Add to .env.local:',
      '   SMTP_HOST="smtp.gmail.com"',
      '   SMTP_PORT="587"',
      '   SMTP_SECURE="false"',
      '   SMTP_USER="your-email@gmail.com"',
      '   SMTP_PASS="16-character-password"',
      '   EMAIL_FROM="Your Name <your-email@gmail.com>"'
    ]
  },

  mailtrap: {
    name: 'Mailtrap (Testing)',
    setupTime: '5 minutes',
    cost: 'Free tier available',
    steps: [
      '1. Go to https://mailtrap.io',
      '2. Sign up for free account',
      '3. Go to Sending Domain',
      '4. Get SMTP credentials from dashboard',
      '5. Add to .env.local:',
      '   SMTP_HOST="smtp.mailtrap.io"',
      '   SMTP_PORT="2525"',
      '   SMTP_USER="your-username"',
      '   SMTP_PASS="your-password"',
      '   EMAIL_FROM="Remoof <no-reply@remoof.bike>"'
    ]
  },

  sendgrid: {
    name: 'SendGrid',
    setupTime: '10 minutes',
    cost: 'Free tier: 100 emails/day',
    steps: [
      '1. Go to https://sendgrid.com',
      '2. Sign up for free account',
      '3. Verify sender email or domain',
      '4. Go to Settings > API Keys',
      '5. Create API Key with Mail Send access',
      '6. Add to .env.local:',
      '   SENDGRID_API_KEY="SG.xxx"',
      '   EMAIL_FROM="Remoof <no-reply@remoof.bike>"',
      '',
      '7. Update lib/mailer.ts to use SendGrid'
    ]
  }
};

// Email sending checklist
export const emailSetupChecklist = [
  '✅ SMTP credentials configured in .env.local',
  '✅ EMAIL_FROM environment variable set',
  '✅ APP_BASE_URL set to your domain',
  '✅ Verification email template customized with your branding',
  '✅ Order confirmation email template customized',
  '✅ Admin notification email configured',
  '✅ Send test email to verify setup',
  '✅ Test forgot password flow',
  '✅ Test order confirmation email'
];

// Testing email locally
export async function testEmailSetup() {
  console.log('Testing email configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('APP_BASE_URL:', process.env.APP_BASE_URL);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing email configuration');
    return false;
  }

  console.log('✅ Email configuration looks good');
  return true;
}

export const emailSystem = {
  features: [
    '📧 Email verification on signup',
    '🔑 Password reset with secure tokens',
    '📦 Order confirmation emails',
    '👨‍💼 Admin order notifications',
    '🚚 Shipping notification emails',
    '💅 Professional HTML email templates',
    '🔒 Secure token-based flows',
    '⏰ Token expiration (1 hour for password reset)',
  ],
  
  endpoints: {
    forgotPassword: 'POST /api/auth/forgot-password',
    resetPassword: 'POST /api/auth/reset-password',
    sendVerification: 'Called automatically during signup',
    orderConfirmation: 'Called when Stripe webhook confirms payment',
  },

  pages: {
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password?token=xxx',
    verify: '/verify?token=xxx',
  }
};
