import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();

  const token = formData.get("cf-turnstile-response") as string;
  const date = formData.get("date") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const count = formData.get("contact") as string;
  const order = formData.get("order") as string;
  const type = formData.get("type") as string;

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
    subject: `New Order: ${name}`,
    text: `You received a new feedback:\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${phone}\nMessage:\n${order}`,
    html: `
      <h2>New Orders</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Count:</strong> ${count}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Order:</strong><br>${order.replace(/\n/g, "<br>")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email" },
      { status: 500 }
    );
  }
};
