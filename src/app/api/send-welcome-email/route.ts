import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("---------------------------------------------------");
        console.log("⚠️ SMTP Credentials not found. Simulating email send.");
        console.log(`To: ${email}`);
        console.log(`Subject: Take a deep breath. Designing just got easy. ☕✨`);
        console.log("---------------------------------------------------");
        return NextResponse.json({ success: true, simulated: true });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const origin = request.headers.get('origin');
    const baseUrl = process.env.NEXTAUTH_URL || origin || 'http://localhost:3000';
    // Ideally, upload your logo to a CDN (like Cloudinary, S3) for best performance and visibility.
    // For now, we assume the logo is in the public folder as 'logo.png'.
    // Note: Localhost URLs won't work for external email recipients.
    const logoUrl = `${baseUrl}/logo.png`; 
    const dashboardLink = `${baseUrl}/dashboard`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; padding: 20px;">
          <img src="${logoUrl}" alt="RetailMediaAI Logo" width="150">
        </div>
        <p>Hi ${name || 'User'},</p>
        <p>Welcome to RetailMediaAI! We are so glad you’re here. 🌿</p>
        <p>We know that creating professional, compliant ads can be stressful—but those days are over. You can officially relax now.</p>
        <p>Whether you are a marketing pro or have zero design experience, our Smart Creative Builder is here to do the heavy lifting for you. Just upload your product, and let our AI handle the layouts, compliance checks, and formatting.</p>
        <p>Ready to create your first masterpiece?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Creating (Stress-Free)</a>
        </div>
        <p>If you need anything, we’re just a reply away. For now, sit back and enjoy the magic of AI.</p>
        <p>Happy creating,</p>
        <p>The RetailMediaAI Team 🚀</p>
      </div>
    `;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"RetailMediaAI" <retailmediaai@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Take a deep breath. Designing just got easy. ☕✨", // Subject line
      html: htmlContent, // html body
    });

    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
