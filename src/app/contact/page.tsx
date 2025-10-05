"use client";

import Script from "next/script";
import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { BookContainer as ContactContainer } from "@/components/BookComponents";

type ContactProps = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

// ลบ declare global ออก เพราะย้ายไปไฟล์ turnstile.d.ts แล้ว


declare global {
  interface Window {
    onTurnstileContact?: (token: string) => void;
    __TURNSTILE_CONTACT_TOKEN__?: string;
    __loadTurnstileContact__?: () => void;
  }
}
const ENABLE_TURNSTILE =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_CONTACT &&
  process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

export default function Contact() {
  const widgetRootRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  
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
        if (window.turnstile?.reset) {
          const id = widgetIdRef.current;
          window.turnstile.reset(id || undefined);
        }
        setToken(null);
      }
      
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

  // รับ token จาก callback
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

  // จัดการ Turnstile widget
  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;

    // ให้สคริปต์ onload เป็นคน render
    window.__loadTurnstileContact__?.();

    // อ่าน widgetId หลัง render เสร็จ (กัน race)
    const el = widgetRootRef.current;
    if (el) {
      setTimeout(() => {
        const id = el.getAttribute("data-widget-id");
        if (id) widgetIdRef.current = id;
      }, 0);
    }

    // Cleanup เมื่อออกจากหน้า
    return () => {
      const id = widgetIdRef.current;
      const el = widgetRootRef.current;

      if (id && window.turnstile?.remove) {
        try { window.turnstile.remove(id); } catch {}
        widgetIdRef.current = null;
      }
      if (el) {
        el.removeAttribute("data-rendered");
        el.removeAttribute("data-widget-id");
      }
    };
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
              container: "w-full",
              title: "text-white font-bold text-[2rem]",
              children: "grid w-full gap-5 max-w-full overflow-x-hidden",
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

            {ENABLE_TURNSTILE && (
              <>
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

                <Script id="turnstile-onload-contact" strategy="afterInteractive">
                  {`
                    (function () {
                      window.__loadTurnstileContact__ = function () {
                        try {
                          var root = document.getElementById("turnstile-contact-root");
                          if (!root || !window.turnstile) return;
                          if (root.getAttribute("data-rendered") === "1") return;


                          var id = window.turnstile.render(root, {
                            sitekey: "${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_CONTACT ?? ""}",
                            callback: function (t) { window.onTurnstileContact && window.onTurnstileContact(t); },
                            appearance: "always",
                            "refresh-expired": "auto",
                            size: "flexible"
                          });
                          root.setAttribute("data-rendered", "1");
                          root.setAttribute("data-widget-id", id);
                        } catch (e) { }
                      };
                    })();
                  `}
                </Script>

                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__loadTurnstileContact__&render=explicit"
                  strategy="afterInteractive"
                />

                <div 
                  id="turnstile-contact-root" 
                  ref={widgetRootRef} 
                  className="cf-turnstile w-full min-h-[72px]"
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