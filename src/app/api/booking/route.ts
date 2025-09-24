import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  const { name, email, subject, message } = await req.json();

  const formData = await req.formData();
  const token = formData.get("cf-turnstile-response") as string;

  const secret = process.env.TURNSTILE_SECRET_KEY!;

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
        token
      )}`,
    }
  );

  const outcome = await verifyRes.json();

  if (!outcome.success) {
    return NextResponse.json(
      { message: "Captcha verification failed" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Feedback Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    replyTo: email,
    subject: `New Feedback: ${subject}`,
    text: `You received a new feedback:\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    html: `
      <h2>New Feedback Received</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
};
