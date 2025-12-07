/**
 * Email templates for Remoof webshop
 */

export const emailTemplates = {
  verificationEmail: (name: string, verifyLink: string) => ({
    subject: '✉️ Verify your Remoof account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              color: #1f2937; 
              background: #f3f4f6;
              margin: 0;
              padding: 0;
            }
            .email-wrapper { 
              background: #f3f4f6; 
              padding: 40px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              text-align: center; 
              padding: 40px 20px;
            }
            .logo { 
              font-size: 36px; 
              font-weight: bold; 
              color: white;
              margin-bottom: 8px;
            }
            .tagline {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              margin: 0;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 {
              color: #111827;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 16px;
            }
            .content p {
              color: #4b5563;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white !important; 
              padding: 16px 48px; 
              border-radius: 8px; 
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            }
            .footer { 
              background: #f9fafb;
              text-align: center; 
              font-size: 13px; 
              color: #6b7280; 
              padding: 30px 20px;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">🚴 Remoof</div>
                <p class="tagline">Bespoke Bicycle Parts</p>
              </div>
              
              <div class="content">
                <h2>Welcome aboard, ${name}! 🎉</h2>
                
                <p>Thank you for signing up for Remoof! We're excited to have you join our community of cycling enthusiasts.</p>
                
                <p>To complete your account setup and start exploring our collection of premium bicycle parts, please verify your email address by clicking the button below:</p>
                
                <div class="button-container">
                  <a href="${verifyLink}" class="button">✓ Verify Email Address</a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px;">This verification link will expire in 24 hours for security purposes.</p>
              </div>
              
              <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
                <p>&copy; 2025 Remoof. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  passwordResetEmail: (name: string, resetLink: string) => ({
    subject: '🔐 Reset your Remoof password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
            .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚴 Remoof</div>
              <p style="color: #6b7280; margin-top: 5px;">Bespoke Bicycle Parts</p>
            </div>
            
            <h2>Password Reset Request</h2>
            
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your Remoof password. Click the button below to create a new password.</p>
              
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              
              <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br/><code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${resetLink}</code></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, ignore this email.
              </div>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 Remoof. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  orderConfirmationEmail: (
    customerName: string,
    orderId: string,
    items: Array<{ title: string; quantity: number; price: number }>,
    subtotal: number,
    tax: number,
    total: number,
    address: string
  ) => ({
    subject: `📦 Order Confirmed - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
            .order-id { background: #dbeafe; padding: 12px; border-radius: 6px; text-align: center; margin: 20px 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: bold; }
            .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .total-amount { font-size: 20px; font-weight: bold; color: #2563eb; }
            .shipping { background: #f0fdf4; padding: 12px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚴 Remoof</div>
              <p style="color: #6b7280; margin-top: 5px;">Bespoke Bicycle Parts</p>
            </div>
            
            <h2>Thank you for your order, ${customerName}!</h2>
            
            <div class="order-id">Order ID: ${orderId}</div>
            
            <h3>Order Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price / 100).toFixed(2)}</td>
                    <td>$${((item.price * item.quantity) / 100).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>$${(tax / 100).toFixed(2)}</span>
              </div>
              <div class="total-row total-amount">
                <span>Total:</span>
                <span>$${(total / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="shipping">
              <strong>📍 Shipping Address</strong>
              <p style="margin-top: 8px; white-space: pre-wrap;">${address}</p>
            </div>
            
            <p style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin: 20px 0;">
              ✅ <strong>Your order is confirmed!</strong> You'll receive a shipping notification as soon as we dispatch your items.
            </p>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit your order status at https://remoof.bike/orders</p>
              <p>&copy; 2025 Remoof. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  adminOrderNotification: (
    orderId: string,
    customerName: string,
    customerEmail: string,
    items: Array<{ title: string; quantity: number; price: number }>,
    total: number,
    address: string
  ) => ({
    subject: `🎉 New Order Received - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
            .order-id { background: #dbeafe; padding: 12px; border-radius: 6px; text-align: center; margin: 20px 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: bold; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚴 Remoof Admin</div>
            </div>
            
            <h2>🎉 New Order Received!</h2>
            
            <div class="order-id">Order ID: ${orderId}</div>
            
            <h3>Customer Information</h3>
            <p>
              <strong>Name:</strong> ${customerName}<br/>
              <strong>Email:</strong> ${customerEmail}
            </p>
            
            <h3>Items Ordered</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price / 100).toFixed(2)}</td>
                    <td>$${((item.price * item.quantity) / 100).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h3>Order Total: $${(total / 100).toFixed(2)}</h3>
            
            <h3>Shipping Address</h3>
            <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${address}</p>
            
            <center>
              <a href="${process.env.APP_BASE_URL}/admin" class="button">View in Admin Panel</a>
            </center>
            
            <div class="footer">
              <p>&copy; 2025 Remoof. Admin System.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  shippingNotificationEmail: (
    customerName: string,
    orderId: string,
    trackingNumber?: string,
    trackingUrl?: string
  ) => ({
    subject: `📦 Your Remoof Order is Shipping - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
            .order-id { background: #dbeafe; padding: 12px; border-radius: 6px; text-align: center; margin: 20px 0; font-weight: bold; }
            .tracking { background: #f0fdf4; border: 2px solid #22c55e; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚴 Remoof</div>
              <p style="color: #6b7280; margin-top: 5px;">Bespoke Bicycle Parts</p>
            </div>
            
            <h2>Your order is on its way! 🚚</h2>
            
            <div class="order-id">Order ID: ${orderId}</div>
            
            <p>Hi ${customerName},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            ${trackingNumber ? `
              <div class="tracking">
                <strong>📍 Tracking Number</strong>
                <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${trackingNumber}</p>
                ${trackingUrl ? `
                  <a href="${trackingUrl}" class="button">Track Your Package</a>
                ` : ''}
              </div>
            ` : ''}
            
            <p style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin: 20px 0;">
              You can also track your order anytime by logging into your account at https://remoof.bike/orders
            </p>
            
            <div class="footer">
              <p>Questions about your shipment? Reply to this email.</p>
              <p>&copy; 2025 Remoof. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

export type EmailTemplate = keyof typeof emailTemplates;
