"use client";

import Script from "next/script";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

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

// เปิด/ปิด Turnstile จาก env (dev ปิด, prod เปิด)
const ENABLE_TURNSTILE =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_BOOKING &&
  process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

export default function Booking() {
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
        } catch {}
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

  // รับ token จาก callback (กัน race ด้วยการประกาศ callback ก่อนโหลด script)
  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;

    function onTokenEvt(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      setToken(detail || null);
    }

    window.addEventListener("turnstile-token", onTokenEvt);
    // เผื่อ callback มาก่อน mount
    if (window.__TURNSTILE_TOKEN__) {
      setToken(window.__TURNSTILE_TOKEN__);
    }
    return () => window.removeEventListener("turnstile-token", onTokenEvt);
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
                {/* ประกาศ callback ให้พร้อมก่อนโหลด script */}
                <Script id="turnstile-callback" strategy="afterInteractive">
                  {`
                    window.onTurnstile = function (t) {
                      window.__TURNSTILE_TOKEN__ = t;
                      window.dispatchEvent(new CustomEvent("turnstile-token", { detail: t }));
                    };
                  `}
                </Script>

                {/* widget */}
                <div
                  className="cf-turnstile m-auto"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_BOOKING}
                  data-callback="onTurnstile"
                  data-appearance="always"
                ></div>

                {/* script ของ Cloudflare */}
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
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
