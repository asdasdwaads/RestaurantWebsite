import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();

  const token = (formData.get("cf-turnstile-response") as string) || "";
  const email = (formData.get("email") as string) || "";
  const message = (formData.get("message") as string) || "";
  const name = (formData.get("name") as string) || "";
  const subject = (formData.get("subject") as string) || "";

  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  const isDevBypass =
    process.env.NODE_ENV !== "production" ||
    process.env.TURNSTILE_DISABLE === "1";

  // Verify captcha เฉพาะตอน prod (หรือถ้าไม่ได้สั่งปิด)
  if (secret && !isDevBypass) {
    if (!token) {
      return NextResponse.json(
        { message: "Captcha token missing" },
        { status: 400 }
      );
    }
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          `secret=${encodeURIComponent(secret)}` +
          `&response=${encodeURIComponent(token)}`,
      }
    );
    const outcome = await verifyRes.json();
    if (!outcome.success) {
      return NextResponse.json(
        { message: "Captcha verification failed" },
        { status: 400 }
      );
    }
  }

  // สร้าง transporter: ใช้ Gmail (EMAIL_SERVICE=gmail) หรือ SMTP_* ถ้าตั้ง
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_FROM,
    EMAIL_TO,
    EMAIL_RECEIVER,
  } = process.env;

  const transporter =
    SMTP_HOST
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT ?? 587),
          secure: String(SMTP_SECURE ?? "false") === "true",
          auth:
            SMTP_USER && SMTP_PASS
              ? { user: SMTP_USER, pass: SMTP_PASS }
              : undefined,
        })
      : nodemailer.createTransport({
          service: EMAIL_SERVICE || "gmail",
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
        });

  const toAddress = EMAIL_TO || EMAIL_RECEIVER;
  const fromAddress =
    EMAIL_FROM || (EMAIL_USER ? `"Feedback Bot" <${EMAIL_USER}>` : undefined);

  const mailOptions = {
    from: fromAddress,
    to: toAddress,
    replyTo: email || undefined,
    subject: `New Feedback: ${subject || "-"}`,
    text: `You received a new feedback:
    
From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`,
    html: `
      <h2>New Feedback Received</h2>
      <p><strong>From:</strong> ${name || "-"}</p>
      <p><strong>Email:</strong> ${email || "-"}</p>
      <p><strong>Subject:</strong> ${subject || "-"}</p>
      <p><strong>Message:</strong><br>${String(message || "")
        .replace(/</g, "&lt;")
        .replace(/\n/g, "<br>")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { success: true, message: "Email sent successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email" },
      { status: 500 }
    );
  }
};
