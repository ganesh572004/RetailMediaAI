import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${Date.now()}`;

    // Check for SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("---------------------------------------------------");
        console.log("⚠️ SMTP Credentials not found. Simulating email send.");
        console.log(`To: ${email}`);
        console.log(`Subject: Reset your password`);
        console.log(`Link: ${resetLink}`);
        console.log("---------------------------------------------------");
        return NextResponse.json({ success: true, simulated: true });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #2563EB;">RetailMediaAI</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 10px;">
          <h2 style="color: #111827; margin-top: 0;">Forgot your password? 🤔</h2>
          <p style="font-size: 16px; line-height: 1.5;">Don't worry, it happens to the best of us! Click the button below to reset your password and get back to creating amazing ads.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #6B7280;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"RetailMediaAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your RetailMediaAI password 🔐',
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
