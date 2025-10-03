import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

type Normalized = {
  date: string;
  name: string;
  email: string;
  phone: string;
  count: string;
  order: string;
  service: string;
  token?: string | null;
};

// ------- Helpers: อ่านทั้ง form-data และ JSON --------
async function readAsForm(req: NextRequest) {
  const form = await req.formData();
  const get = (k: string) => (form.get(k) as string) || "";
  const token = (form.get("cf-turnstile-response") as string) || "";
  const payload: Normalized = {
    date: get("date"),
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    count: get("count") || get("contact"), // เผื่อชื่อเก่า
    order: get("order"),
    service: get("service") || get("type"),
    token,
  };
  return payload;
}

async function readAsJson(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const payload: Normalized = {
    date: body.date ?? "",
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    count: body.count ?? body.contact ?? "",
    order: body.order ?? "",
    service: body.service ?? body.type ?? "",
    token: body.turnstileToken ?? body["cf-turnstile-response"] ?? null,
  };
  return payload;
}

// --------------------- Handler -----------------------
export const POST = async (req: NextRequest) => {
  // รองรับทั้ง multipart/form-data และ JSON
  const ctype = req.headers.get("content-type") || "";
  const data: Normalized = ctype.includes("form")
    ? await readAsForm(req)
    : await readAsJson(req);

  const { date, name, email, phone, count, order, service, token } = data;

  // Bypass Turnstile บน dev หรือเมื่อสั่งปิดด้วย env
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const isDevBypass =
    process.env.NODE_ENV !== "production" ||
    process.env.TURNSTILE_DISABLE === "1";

  if (turnstileSecret && !isDevBypass) {
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
          `secret=${encodeURIComponent(turnstileSecret)}` +
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

  // Nodemailer transporter (เลือก: SMTP_* หรือ Gmail service)
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_SERVICE,
    EMAIL_FROM,
    EMAIL_TO,
    EMAIL_RECEIVER,
    EMAIL_USER,
    EMAIL_PASS,
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
    EMAIL_FROM || (EMAIL_USER ? `"Booking Bot" <${EMAIL_USER}>` : undefined);

  const mailOptions = {
    from: fromAddress,
    to: toAddress,
    replyTo: email || undefined,
    subject: `New Order • ${name || "Guest"} • ${service || "Service"} • ${
      date || "N/A"
    }`,
    text: [
      `New Order Received`,
      `--------------------------------`,
      `From   : ${name}`,
      `Email  : ${email}`,
      `Phone  : ${phone}`,
      `Count  : ${count}`,
      `Date   : ${date}`,
      `Service: ${service}`,
      `--------------------------------`,
      `Order details:`,
      `${order}`,
    ].join("\n"),
    html: `
      <h2>New Order</h2>
      <p><strong>From:</strong> ${name || "-"}</p>
      <p><strong>Email:</strong> ${email || "-"}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Count:</strong> ${count || "-"}</p>
      <p><strong>Date:</strong> ${date || "-"}</p>
      <p><strong>Service:</strong> ${service || "-"}</p>
      <hr />
      <p><strong>Order:</strong><br/>${String(order || "").replace(/\n/g, "<br/>")}</p>
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
