"use client";

import Script from "next/script";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { BookContainer as ContactContainer } from "@/components/BookComponents";

type ContactProps = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

declare global {
  interface Window {
    onTurnstileContact?: (token: string) => void;
    __TURNSTILE_CONTACT_TOKEN__?: string;
  }
}

// เปิด/ปิด Turnstile จาก env (dev ปิด, prod เปิด)
const ENABLE_TURNSTILE =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_CONTACT &&
  process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

export default function Contact() {
  const [form, setForm] = useState<ContactProps>({});
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleOnChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSendEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const fd = new FormData(event.currentTarget);
      if (ENABLE_TURNSTILE && token) {
        fd.set("cf-turnstile-response", token);
      }

      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setMsg("Message sent! Thank you.");
      setForm({});
      if (ENABLE_TURNSTILE) {
        if (window.turnstile?.reset) window.turnstile.reset();
        setToken(null);
      }
      // เคลียร์อินพุต (ค่าผูกกับ state จะถูกเคลียร์เอง)
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Send failed";
      setMsg(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // รับ token จาก callback (กัน race)
  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;

    const onTokenEvt = (e: Event) => {
      const ce = e as CustomEvent<string>;
      const detail = typeof ce.detail === "string" ? ce.detail : "";
      setToken(detail || null);
    };

    const EVENT_NAME = "turnstile-token:contact";
    window.addEventListener(EVENT_NAME, onTokenEvt as EventListener);
    if (typeof window.__TURNSTILE_CONTACT_TOKEN__ === "string") {
      setToken(window.__TURNSTILE_CONTACT_TOKEN__ || null);
    }
    return () => window.removeEventListener(EVENT_NAME, onTokenEvt as EventListener);
  }, []);

  return (
    <div className="relative">
      <Image
        src="/assets/contact/bg.jpeg"
        alt="Not found image"
        className="absolute h-full object-cover"
        fill
      />
      <div className="relative flex flex-wrap-reverse justify-center gap-5 py-10 bg-[#00000091]">
        <div className="w-[300px] smartphone:w-[400px] y-tablet:w-[500px] h-[60vh] smartphone:h-[80vh]">
          <iframe
            className="w-full h-full rounded-[10px]"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d675.441249820311!2d15.094200543816525!3d47.377504924512905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4771df8f52936ca5%3A0xec94f616321ecf92!2sCharm%20Thai%20Restaurant!5e0!3m2!1sth!2sth!4v1758546578365!5m2!1sth!2sth"
          />
        </div>

        <div className="w-[300px] smartphone:w-[400px] y-tablet:w-[500px]">
          <ContactContainer
            title="Feedback"
            styles={{
              container: "w-full h-screen x-tablet:h-[80vh]",
              title: "text-white font-bold text-[2rem]",
              children: "grid w-full gap-5",
            }}
            onSubmit={handleSendEmail}
          >
            <input
              type="text"
              name="name"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              placeholder="Name"
              onChange={handleOnChange}
              required
              value={form.name || ""}
            />
            <input
              type="email"
              name="email"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              placeholder="Email"
              onChange={handleOnChange}
              required
              value={form.email || ""}
            />
            <input
              type="text"
              name="subject"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              placeholder="Subject"
              onChange={handleOnChange}
              required
              value={form.subject || ""}
            />
            <textarea
              name="message"
              className="bg-white rounded-[10px] p-2 resize-none overflow-auto h-[250px]"
              placeholder="Message"
              onChange={handleOnChange}
              required
              value={form.message || ""}
            ></textarea>

            {/* Turnstile: แสดงเมื่อเปิดใช้ */}
            {ENABLE_TURNSTILE && (
              <>
                {/* ประกาศ callback ก่อนโหลด script */}
                  <Script id="turnstile-callback-contact" strategy="afterInteractive">
                    {`
                      (function () {
                        window.onTurnstileContact = function (t) {
                          if (typeof t === "string" && t.length > 0) {
                            window.__TURNSTILE_CONTACT_TOKEN__ = t;
                            window.dispatchEvent(new CustomEvent("turnstile-token:contact", { detail: t }));
                          }
                        };
                      })();
                    `}
                  </Script>
                <div
                  className="cf-turnstile m-auto"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_CONTACT}
                  data-callback="onTurnstileContact"
                  data-appearance="always"
                ></div>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  strategy="afterInteractive"
                />
              </>
            )}

            <button
              className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer w-full pb-2 disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>

            {msg && (
              <p className="text-center text-white font-semibold">{msg}</p>
            )}
          </ContactContainer>
        </div>
      </div>
    </div>
  );
}