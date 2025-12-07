import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendMail } from '@/lib/mailer';

/**
 * Test endpoint to send a test email
 * Only accessible to admin users
 * Usage: POST /api/test/send-email with { email: "test@example.com" }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Only allow admin users to access this
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    await sendMail({
      to: email,
      subject: '✅ Remoof Email Test',
      html: `
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>🎉 Email Test Successful!</h1>
              <p>Your email configuration is working correctly.</p>
              
              <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Test Details:</strong></p>
                <p>Sent to: ${email}</p>
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>From: ${process.env.EMAIL_FROM}</p>
              </div>
              
              <p>You can now proceed with setting up the rest of your email system.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <p>&copy; 2025 Remoof</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return NextResponse.json({ 
      message: `Test email sent to ${email}`,
      success: true 
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { message: 'Failed to send test email', error: String(error) },
      { status: 500 }
    );
  }
}
