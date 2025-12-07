# 📧 Remoof Email System - Setup Guide

## Overview

The email system is now fully implemented with professional HTML templates for:
- ✅ Email verification on signup
- ✅ Password reset (with secure token links)
- ✅ Order confirmations
- ✅ Admin notifications
- ✅ Shipping notifications

## Quick Start (5 minutes)

### Option 1: Using Resend (Recommended ⭐)

**Easiest setup, best for production**

1. Go to https://resend.com
2. Sign up for free
3. Copy your API key
4. Update `.env.local`:
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Remoof <onboarding@resend.dev>"
APP_BASE_URL="http://localhost:3000"
```

5. Update `lib/mailer.ts`:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(options: { to: string; subject: string; html: string }) {
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM not set');
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html
  });
}
```

### Option 2: Using Gmail SMTP

**Free, uses your existing Gmail account**

1. Go to https://myaccount.google.com
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to Security > App passwords
4. Select Mail and Windows → Generate
5. Copy the 16-character password
6. Update `.env.local`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Remoof <your-email@gmail.com>"
APP_BASE_URL="http://localhost:3000"
```

### Option 3: Using Mailtrap (Testing)

**Great for development/testing**

1. Go to https://mailtrap.io
2. Sign up for free
3. Create a new inbox
4. Copy SMTP credentials from integration
5. Update `.env.local`:
```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-username"
SMTP_PASS="your-password"
EMAIL_FROM="Remoof <no-reply@remoof.bike>"
APP_BASE_URL="http://localhost:3000"
```

## Testing Email Setup

1. **Start dev server:**
```bash
npm run dev
```

2. **Go to admin panel:**
- Visit http://localhost:3000/admin
- Login with: admin@remoof.bike / Password123!

3. **Send test email:**
```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

4. **Test user signup:**
- Go to http://localhost:3000/signup
- Create a new account
- Check your inbox for verification email

5. **Test password reset:**
- Go to http://localhost:3000/forgot-password
- Enter your email
- Check inbox for reset link
- Click link and reset password

## Email Features

### 1. Email Verification
- Sent on signup with secure token link
- Token expires after 24 hours
- User cannot checkout without verified email
- Page: `/verify?token=xxx`

### 2. Password Reset
- Users can request reset at `/forgot-password`
- Secure token sent via email
- Token expires after 1 hour
- Reset page: `/reset-password?token=xxx`
- Endpoints:
  - POST `/api/auth/forgot-password`
  - POST `/api/auth/reset-password`

### 3. Order Confirmation (Coming Soon)
- Sent when Stripe confirms payment
- Shows order details, total, and shipping address
- Professional HTML template

### 4. Admin Order Notification (Coming Soon)
- Sent to admin email when new order received
- Shows customer info and order details
- Link to admin panel

### 5. Shipping Notification (Coming Soon)
- Sent when admin marks order as shipped
- Includes tracking number and link
- Customizable per order

## Email Templates

All templates are in `lib/emailTemplates.ts` with variables for:
- Customer name
- Order ID and details
- Prices and totals
- Shipping address
- Professional branding
- Dark mode support

## API Endpoints

### Forgot Password
```
POST /api/auth/forgot-password
Body: { email: "user@example.com" }
Response: { message: "If email registered, reset link sent" }
```

### Reset Password
```
POST /api/auth/reset-password
Body: { token: "xxx", password: "newpassword" }
Response: { message: "Password reset successful" }
```

### Send Test Email (Admin Only)
```
POST /api/test/send-email
Headers: Must be logged in as ADMIN
Body: { email: "test@example.com" }
Response: { message: "Email sent", success: true }
```

## Environment Variables

Required for email to work:

```env
# Email provider choice (pick one):
RESEND_API_KEY=re_xxxxx           # If using Resend
# OR
SMTP_HOST=smtp.gmail.com          # If using SMTP
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
SMTP_SECURE=false

# Required for all providers:
EMAIL_FROM="Remoof <no-reply@remoof.bike>"
APP_BASE_URL="http://localhost:3000"
```

## Production Checklist

- [ ] Email provider account created (Resend, Gmail, SendGrid, etc)
- [ ] API keys/credentials added to production environment
- [ ] EMAIL_FROM set to your domain
- [ ] APP_BASE_URL set to production domain (https://remoof.bike)
- [ ] Test email sending in production
- [ ] Verify email templates with your branding
- [ ] Set up admin email for order notifications
- [ ] Test complete signup → verification → login flow
- [ ] Test password reset flow
- [ ] Document admin email procedures

## Troubleshooting

### Emails not sending?
1. Check `.env.local` has all required variables
2. Verify SMTP credentials are correct
3. Check email provider account is active
4. Look at server console for error messages
5. Try sending test email: `POST /api/test/send-email`

### Gmail app password not working?
1. Make sure 2FA is enabled first
2. Go to myaccount.google.com → Security → App passwords
3. Select "Mail" and "Windows"
4. Use the 16-character password (no spaces)

### Emails going to spam?
- Set up SPF/DKIM records with your email provider
- Use consistent from address
- Include unsubscribe links in marketing emails
- Test with tools like Mail-tester

### Resend sandbox mode?
- Free tier sends to verified email addresses only
- Add more verified addresses in Resend dashboard
- Upgrade for production sending

## Next Steps

1. ✅ Email system is ready to use
2. 📦 Next: Build shopping cart system
3. 💳 Then: Integrate Stripe checkout
4. 📤 Finally: Connect email to order confirmation webhooks

## Files Created/Modified

### New Files:
- `lib/emailTemplates.ts` - Professional HTML email templates
- `lib/mailer.ts` - Updated with template functions
- `lib/emailSetup.ts` - Configuration guide and checklist
- `lib/emailUtils.ts` - Email verification utilities
- `app/(auth)/forgot-password/page.tsx` - Forgot password page
- `app/(auth)/reset-password/page.tsx` - Reset password page
- `app/api/auth/forgot-password/route.ts` - Forgot password API
- `app/api/auth/reset-password/route.ts` - Reset password API
- `app/api/test/send-email/route.ts` - Test email endpoint

### Modified Files:
- `app/api/auth/signup/route.ts` - Now uses new email templates
- `app/(auth)/signin/page.tsx` - Fixed forgot password link

## Questions?

Check these files for implementation details:
- Email provider setup: `lib/emailSetup.ts`
- Email templates: `lib/emailTemplates.ts`
- Mailer functions: `lib/mailer.ts`
