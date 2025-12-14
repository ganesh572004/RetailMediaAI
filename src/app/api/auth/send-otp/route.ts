import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check for SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("---------------------------------------------------");
        console.log("⚠️ SMTP Credentials not found. Simulating OTP send.");
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log("---------------------------------------------------");
        // Return OTP in response for simulation/testing
        return NextResponse.json({ success: true, otp, simulated: true });
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

    // Verify connection configuration
    try {
        await transporter.verify();
    } catch (error) {
        console.error("SMTP Connection Error:", error);
        return NextResponse.json({ error: 'Email service unavailable' }, { status: 500 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify your email</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use the following code to verify your email address for RetailMediaAI:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    try {
        await transporter.sendMail({
            from: `"RetailMediaAI" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Verification Code",
            html: htmlContent,
        });
    } catch (sendError: any) {
        console.error("Send Mail Error:", sendError);
        // If the email doesn't exist, Gmail might return a specific error code or message
        // 550-5.1.1 is often "User unknown"
        if (sendError.response && (sendError.response.includes('550') || sendError.response.includes('doesn\'t exist'))) {
             return NextResponse.json({ error: 'This email address does not exist.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to send verification email. Please check the address.' }, { status: 400 });
    }

    // In a real app, we would store the hash of the OTP in a DB/Redis with expiration.
    // For this client-side heavy app, we will return the OTP to the client to be validated there 
    // (or the client could send it back, but we have no session store).
    // SECURITY NOTE: Returning OTP to client is not secure for production, but fits this specific architecture.
    return NextResponse.json({ success: true, otp });

  } catch (error) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
