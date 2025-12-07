#!/bin/bash

# Remoof Email System Quick Setup
# This script helps set up email for local development

echo "🚀 Remoof Email System Setup"
echo "===================================="
echo ""
echo "Which email provider would you like to use?"
echo ""
echo "1) Resend (Recommended - easiest)"
echo "2) Gmail SMTP"
echo "3) Mailtrap (Testing)"
echo "4) SendGrid"
echo "0) Skip (manual setup)"
echo ""
read -p "Enter number (0-4): " choice

case $choice in
  1)
    echo ""
    echo "📧 Resend Setup"
    echo "1. Go to https://resend.com"
    echo "2. Sign up for free"
    echo "3. Copy your API key"
    echo "4. Run: cp .env.example .env.local"
    echo "5. Edit .env.local and add:"
    echo "   RESEND_API_KEY=re_your_key_here"
    echo ""
    echo "Then update lib/mailer.ts to use Resend SDK"
    echo "See EMAIL_SETUP.md for details"
    ;;
  
  2)
    echo ""
    echo "📧 Gmail SMTP Setup"
    echo "1. Go to https://myaccount.google.com"
    echo "2. Enable 2-Factor Authentication"
    echo "3. Go to Security > App passwords"
    echo "4. Generate app password for Mail"
    echo "5. Run: cp .env.example .env.local"
    echo "6. Edit .env.local and add:"
    echo "   SMTP_HOST=smtp.gmail.com"
    echo "   SMTP_PORT=587"
    echo "   SMTP_USER=your-email@gmail.com"
    echo "   SMTP_PASS=your-16-char-password"
    echo "   EMAIL_FROM=\"Remoof <your-email@gmail.com>\""
    echo ""
    ;;
  
  3)
    echo ""
    echo "📧 Mailtrap Setup (for testing)"
    echo "1. Go to https://mailtrap.io"
    echo "2. Sign up for free"
    echo "3. Create new inbox"
    echo "4. Copy SMTP credentials"
    echo "5. Run: cp .env.example .env.local"
    echo "6. Edit .env.local and add the Mailtrap SMTP details"
    echo "7. Set EMAIL_FROM to your Remoof email"
    echo ""
    ;;
  
  4)
    echo ""
    echo "📧 SendGrid Setup"
    echo "1. Go to https://sendgrid.com"
    echo "2. Sign up for free account"
    echo "3. Create API Key with Mail Send access"
    echo "4. Update .env.local with SENDGRID_API_KEY"
    echo "5. Update lib/mailer.ts to use SendGrid SDK"
    echo ""
    ;;
  
  0)
    echo ""
    echo "ℹ️  Check EMAIL_SETUP.md for detailed setup instructions"
    echo ""
    ;;
  
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "After setup, test with:"
echo "1. Start dev server: npm run dev"
echo "2. Login to admin: http://localhost:3000/admin"
echo "3. Send test email: curl -X POST http://localhost:3000/api/test/send-email -H \"Content-Type: application/json\" -d '{\"email\": \"your-email@example.com\"}'"
echo ""
echo "See EMAIL_SETUP.md for complete guide"
