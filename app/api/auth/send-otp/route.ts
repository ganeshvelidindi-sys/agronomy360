import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ── Persist across Next.js hot-module reloads in dev ─────────
// A plain `new Map()` at module level gets wiped on every HMR reload.
// Using `global` keeps it alive across reloads so OTPs are not lost.
const g = global as typeof globalThis & {
  _agr360_otpStore?: Map<string, { otp: string; expiresAt: number }>;
  _agr360_mailer?: nodemailer.Transporter;
};

if (!g._agr360_otpStore) {
  g._agr360_otpStore = new Map<string, { otp: string; expiresAt: number }>();
}
const otpStore = g._agr360_otpStore;

function getTransporter() {
  if (!g._agr360_mailer) {
    g._agr360_mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return g._agr360_mailer;
}


export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address enter చేయండి.' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min validity
    otpStore.set(cleanEmail, { otp: generatedOtp, expiresAt });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.log(`[AGRONOMY 360] OTP for ${cleanEmail}: ${generatedOtp}`);
      return NextResponse.json({
        success: true,
        message: 'Gmail credentials not configured.',
        realEmail: false,
        debugOtp: generatedOtp,
      });
    }

    // Send real email via Gmail SMTP
    const mailOptions = {
      from: `"Agronomy 360 🌾" <${gmailUser}>`,
      to: cleanEmail,
      subject: `${generatedOtp} — Agronomy 360 Login OTP`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 40px;text-align:center;">
                    <div style="font-size:36px;margin-bottom:8px;">🌾</div>
                    <div style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:1px;">AGRONOMY 360</div>
                    <div style="color:#bbf7d0;font-size:13px;margin-top:4px;">Direct Farm to Buyer</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 24px;">
                    <p style="color:#374151;font-size:16px;margin:0 0 8px;">నమస్కారం 🙏</p>
                    <p style="color:#374151;font-size:15px;margin:0 0 28px;line-height:1.6;">
                      మీ <strong>Agronomy 360</strong> login కోసం One-Time Password (OTP):
                    </p>
                    <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                      <div style="font-size:48px;font-weight:bold;color:#15803d;letter-spacing:12px;font-family:monospace;">${generatedOtp}</div>
                      <div style="color:#6b7280;font-size:13px;margin-top:10px;">⏱ 5 నిమిషాల్లో expire అవుతుంది</div>
                    </div>
                    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                      మీరు ఈ OTP request చేయలేదు అంటే, దయచేసి ignore చేయండి.<br>
                      ఈ OTP ఎవరికీ చెప్పవద్దు.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">Agronomy 360 — రైతు నుండి నేరుగా మీ ఇంటికి 🏡</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `Agronomy 360 Login OTP: ${generatedOtp}\n\nOTP 5 నిమిషాల్లో expire అవుతుంది.\nఈ OTP ఎవరికీ చెప్పవద్దు.`,
    };

    await getTransporter().sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${cleanEmail}`,
      realEmail: true,
    });
  } catch (err: any) {
    console.error('send-otp error:', err);
    return NextResponse.json(
      { error: err.message || 'OTP send failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Verification endpoint
export async function PUT(req: Request) {
  try {
    const { email, otp } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const entered = String(otp || '').trim();

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return NextResponse.json(
        { error: 'OTP expired లేదా found కాలేదు. దయచేసి Resend OTP click చేయండి.' },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return NextResponse.json(
        { error: 'OTP expire అయింది. దయచేసి new OTP request చేయండి.' },
        { status: 400 }
      );
    }

    if (record.otp !== entered) {
      return NextResponse.json(
        { error: 'తప్పు OTP! మీ Gmail లో చూసిన code enter చేయండి.' },
        { status: 400 }
      );
    }

    // Success — clear OTP to prevent replay attacks
    otpStore.delete(cleanEmail);
    return NextResponse.json({ success: true, verified: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Verification error' },
      { status: 500 }
    );
  }
}

