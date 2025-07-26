import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  const { name, email, subject, message } = await req.json();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Feedback Bot" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
    to: process.env.NEXT_PUBLIC_EMAIL_RECEIVER,
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

  console.log("Receiver Email:", process.env.NEXT_PUBLIC_EMAIL_RECEIVER);

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ status: 500 });
  }
};
