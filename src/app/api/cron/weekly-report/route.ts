import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, usageData } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // 1. Generate Graph URL (QuickChart)
    // Use real data if provided, otherwise fallback to random (or zeros)
    const labels = usageData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = usageData?.data || Array.from({ length: 7 }, () => 0);
    
    const chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Minutes Spent on Site',
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Your Weekly Activity (Minutes)'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
      }
    };
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    // 2. Funny Message
    const funnyMessages = [
      "Why did the marketer break up with the calendar? Because their dates were always expiring! 😂",
      "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads. 🍫",
      "SEO is like a gym membership: you have to keep going to see results! 💪",
      "Why don't marketers like trampolines? They're afraid of high bounce rates! 📉",
      "What is a social media manager's favorite snack? Insta-graham crackers! 🍪"
    ];
    const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    // 3. Send Email
    // Use SMTP_USER/SMTP_PASS from .env.local
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!user || !pass) {
        console.log("--- [MOCK EMAIL SERVICE] ---");
        console.log(`To: ${email}`);
        console.log("Subject: Your Weekly RetailMediaAI Report 🚀");
        console.log(`Funny Message: ${randomMsg}`);
        console.log(`Chart URL: ${chartUrl}`);
        console.log("----------------------------");
        
        // Return success for the UI even if we just logged it
        return NextResponse.json({ 
            success: true, 
            message: "Mock email sent (Check server console). Configure SMTP_USER/SMTP_PASS for real emails." 
        });
    }

    let transporter;
    
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: user,
          pass: pass
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass
        }
      });
    }

    await transporter.sendMail({
      from: '"RetailMediaAI" <no-reply@retailmedia.ai>',
      to: email,
      subject: 'Your Weekly RetailMediaAI Report 🚀',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">RetailMediaAI</h1>
            <p style="color: #64748b; margin-top: 5px;">Weekly Performance Update</p>
          </div>

          <p style="font-size: 16px; color: #334155;">Hey there! 👋</p>
          <p style="font-size: 16px; color: #334155;">Here's a snapshot of your creative activity this week. You're doing great!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${chartUrl}" alt="Weekly Chart" style="width: 100%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="margin-top: 0; color: #7c3aed;">💡 Weekly Giggle</h3>
            <p style="font-style: italic; color: #475569; font-size: 16px; margin-bottom: 0;">"${randomMsg}"</p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 18px; font-weight: bold; color: #0f172a;">Visit the website again and make your dreams and visuals come true! ✨</p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
          </div>
          
          <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
            Sent with ❤️ by RetailMediaAI<br>
            You received this because you are subscribed to weekly reports.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
