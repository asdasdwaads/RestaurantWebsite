"use client";

import Script from "next/script";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";

import { BookContainer } from "@/components/BookComponents";
import { MenuPDF } from "@/components/MenuComponents";
import menu from "@/database/menu.test.json";


type FormShape = {
  date?: string;
  name?: string;
  phone?: string;
  email?: string;
  count?: string;
  order?: string;
  service?: string;
};
declare global {
  interface Window {
    onTurnstileBooking?: (token: string) => void;
    __TURNSTILE_BOOKING_TOKEN__?: string;


    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey: string;
        callback: (token: string) => void;
        appearance?: "always" | "execute" | "interaction-only";
        "refresh-expired"?: "auto" | "manual";
      }) => string; // widgetId
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };


    __loadTurnstileBooking__?: () => void;
  }
}


// เปิด/ปิด Turnstile จาก env (dev ปิด, prod เปิด)
const ENABLE_TURNSTILE =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_BOOKING &&
  process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

export default function Booking() {
  const widgetRootRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const services = [
    { label: "Eat at restaurant", htmlFor: "restaurant", id: "restaurant" },
    { label: "Take away", htmlFor: "house", id: "house" },
    { label: "Cooking at house", htmlFor: "cooking", id: "cooking" },
  ];

  const [form, setForm] = useState<FormShape>({});
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleOnChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const fd = new FormData(event.currentTarget);

      // แนบ token เฉพาะตอนเปิดใช้ Turnstile
      if (ENABLE_TURNSTILE && token) {
        fd.set("cf-turnstile-response", token);
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setMessage("Order sent! Thank you.");
      setForm({}); // reset state

      // reset input values (ให้ input ผูกกับ state อยู่แล้วจะเคลียร์เอง)
      // reset turnstile ถ้าเปิดใช้
      if (ENABLE_TURNSTILE) {
        try {
          if (window.turnstile?.reset) window.turnstile.reset();
          setToken(null);
        } catch { }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Send failed";
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
  if (!ENABLE_TURNSTILE) return;

  const onTokenEvt = (e: Event) => {
    const ce = e as CustomEvent<string>;
    const detail = typeof ce.detail === "string" ? ce.detail : "";
    setToken(detail || null);
  };

  const EVENT_NAME = "turnstile-token:booking";
  window.addEventListener(EVENT_NAME, onTokenEvt as EventListener);

  // รองรับเคสที่ token มาถึงก่อน mount
  if (typeof window.__TURNSTILE_BOOKING_TOKEN__ === "string") {
    setToken(window.__TURNSTILE_BOOKING_TOKEN__ || null);
  }

  return () => {
    window.removeEventListener(EVENT_NAME, onTokenEvt as EventListener);
  };
}, []);

  // รับ token จาก callback (กัน race ด้วยการประกาศ callback ก่อนโหลด script)
  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;

    
    window.__loadTurnstileBooking__?.();

    
    const el = widgetRootRef.current;
    if (el) {
      const id = el.getAttribute("data-widget-id");
      if (id) widgetIdRef.current = id;
    }

    
    return () => {
      const id = widgetIdRef.current;
      if (id && window.turnstile?.remove) {
        try { window.turnstile.remove(id); } catch { /* no-op */ }
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
      <img
        src="/assets/booking/bg.jpeg"
        alt="Not found image"
        className="absolute h-full object-cover"
      />
      <div className="relative bg-[#00000091] w-full h-full flex flex-col items-center">
        <div className="text-white py-20 text-[4rem] smartphone:text-[6rem] font-bold">
          <h1>BOOKING</h1>
        </div>

        <div className="flex flex-wrap gap-5 justify-center">
          <BookContainer
            title="Menu"
            styles={{
              container: "w-[300px] smartphone:w-[400px] y-tablet:w-[500px]",
              title: "text-white font-bold text-[2rem]",
            }}
          >
            <MenuPDF
              menu={menu.menuPDF}
              styles={{
                container: "relative",
                image: "min-w-full box-border h-full",
                button: "text-[2rem] p-2",
              }}
            />
            <div className="text-emerald-400 font-bold flex flex-col y-tablet:flex-row items-center y-tablet:justify-between pt-4 text-[0.9rem]">
              <div>
                <Link href="/assets/menu/pdf/menu_English.pdf" target="_blank">
                  Download the PDF for English
                </Link>
              </div>
              <div>
                <Link href="/assets/menu/pdf/menu_German.pdf" target="_blank">
                  Download the PDF for German
                </Link>
              </div>
            </div>
          </BookContainer>

          <BookContainer
            onSubmit={handleSubmit}
            title="Order Details"
            styles={{
              container:
                "w-[300px] smartphone:w-[400px] y-tablet:w-[500px] justify-between",
              title: "text-white font-bold text-[2rem]",
              children: "grid w-full gap-5",
            }}
          >
            <input
              type="date"
              name="date"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              required
              onChange={handleOnChange}
              value={form.date || ""}
            />
            <input
              type="text"
              name="name"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              required
              placeholder="Name"
              onChange={handleOnChange}
              value={form.name || ""}
            />
            <input
              type="text"
              name="phone"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              required
              placeholder="Phone"
              onChange={handleOnChange}
              value={form.phone || ""}
            />
            <input
              type="email"
              name="email"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              required
              placeholder="Email"
              onChange={handleOnChange}
              value={form.email || ""}
            />
            <input
              type="number"
              name="count"
              className="bg-white w-full h-[40px] rounded-[10px] px-2"
              required
              placeholder="Count"
              onChange={handleOnChange}
              value={form.count || ""}
            />
            <textarea
              name="order"
              className="bg-white rounded-[10px] p-2 resize-none h-[300px] overflow-auto"
              required
              placeholder="Enter your order details here..."
              onChange={handleOnChange}
              value={form.order || ""}
            ></textarea>

            <div className="text-white grid y-tablet:flex gap-4 y-tablet:gap-2">
              {services.map((service, index) => (
                <div className="flex items-center gap-1 w-full" key={index}>
                  <input
                    type="radio"
                    name="service"
                    id={service.id}
                    value={service.label}
                    onChange={handleOnChange}
                    required
                    className="appearance-none border-2 min-w-5 min-h-5 rounded-full checked:bg-emerald-400 duration-300"
                    checked={form.service === service.label}
                  />
                  <label
                    className="text-[0.8rem] y-tablet:text-[1rem] w-full text-nowrap"
                    htmlFor={service.htmlFor}
                  >
                    {service.label}
                  </label>
                </div>
              ))}
            </div>

            {/* Turnstile: แสดงเฉพาะเมื่อเปิดใช้ */}
            {ENABLE_TURNSTILE && (
              <>
                {/* ประกาศ callback สำหรับหน้า booking โดยเฉพาะ (ไม่ใช้ any) */}
                <Script id="turnstile-callback-booking" strategy="afterInteractive">
                  {`
                    (function () {
                      window.onTurnstileBooking = function (t) {
                        if (typeof t === "string" && t.length > 0) {
                          window.__TURNSTILE_BOOKING_TOKEN__ = t;
                          window.dispatchEvent(new CustomEvent("turnstile-token:booking", { detail: t }));
                        }
                      };
                    })();
                    `}
                </Script>

                <Script id="turnstile-onload-booking" strategy="afterInteractive">
                  {`
                    (function () {
                      window.__loadTurnstileBooking__ = function () {
                        try {
                          var root = document.getElementById("turnstile-booking-root");
                          if (!root || !window.turnstile) return;
                          // กัน render ซ้ำตอนกลับเข้าหน้า
                          if (root.getAttribute("data-rendered") === "1") return;

                          var id = window.turnstile.render(root, {
                            sitekey: "${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_BOOKING ?? ""}",
                            callback: function (t) { window.onTurnstileBooking && window.onTurnstileBooking(t); },
                            appearance: "always",
                            "refresh-expired": "auto"
                          });
                          root.setAttribute("data-rendered", "1");
                          root.setAttribute("data-widget-id", id);
                        } catch (e) { /* no-op */ }
                      };
                    })();
                  `}
                </Script>
                {/* widget */}
                <div
                  id="turnstile-booking-root"
                  ref={widgetRootRef}
                  className="cf-turnstile m-auto"
                />

                {/* script ของ Cloudflare */}
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__loadTurnstileBooking__&render=explicit"
                  strategy="afterInteractive"
                />
              </>
            )}

            <button
              className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Order now"}
            </button>

            {message && (
              <p className="text-center text-white font-semibold">{message}</p>
            )}
          </BookContainer>
        </div>

        <div className="flex items-center py-8 y-tablet:py-16">
          <h1 className="text-white text-[1rem] smartphone:text-[1.5rem] y-tablet:text-[2rem] font-bold">
            Available in
          </h1>
          <Link
            href="https://www.foodora.at/restaurant/rjxp/charm-thai"
            target="_blank"
          >
            <img
              src="/Foodora_Logo.png"
              alt="Not found logo"
              className="w-[150px] smartphone:w-[200px] y-tablet:w-[300px]"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}