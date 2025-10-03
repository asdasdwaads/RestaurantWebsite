"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
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

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_BOOKING!;
const ENABLE_TURNSTILE =
  !!SITE_KEY && process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

declare global {
  interface Window {
    onTurnstileBooking?: (t: string) => void;
  }
}


export default function Booking() {
  const services = [
    { label: "Eat at restaurant", htmlFor: "restaurant", id: "restaurant" },
    { label: "Take away", htmlFor: "house", id: "house" },
    { label: "Cooking at house", htmlFor: "cooking", id: "cooking" },
  ];

  const [form, setForm] = useState<FormShape>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // ตั้ง callback เฉพาะหน้า Booking และเขียน token ลง hidden input
  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;
     window.onTurnstileBooking = (t: string) => {
      const inp = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="cf-turnstile-response"]'
      );
      if (inp) inp.value = t;
    };
    return () => {
      const inp = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="cf-turnstile-response"]'
      );
      if (inp) inp.value = "";
    };
  }, []);

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

      // ยืนยันว่ามี token ถ้าเปิดใช้
      if (ENABLE_TURNSTILE) {
        const token = (fd.get("cf-turnstile-response") as string) || "";
        if (!token) {
          setMessage("Please complete the CAPTCHA.");
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setMessage("Order sent! Thank you.");
      setForm({});
      // รีเซ็ต token ที่ hidden input (ตัว widget จะรีเฟรชเอง)
      const inp = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="cf-turnstile-response"]'
      );
      if (inp) inp.value = "";
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

          {/* ฟอร์ม Order */}
          <BookContainer
            onSubmit={handleSubmit}
            title="Order Details"
            styles={{
              container:
                "w-[300px] smartphone:w-[400px] y-tablet:w-[500px] justify-between",
              title: "text-white font-bold text-[2rem]",
              children: "grid w-full gap-5",
            }}
            // ถ้า BookContainer เป็น <form> ภายใน ให้ส่ง ref ด้วย
            // @ts-ignore – สมมติ BookContainer ส่งต่อ ref ไปยัง <form>
            ref={formRef}
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

            {/* Turnstile widget + hidden token (ไม่มี Script ในหน้านี้แล้ว) */}
            {ENABLE_TURNSTILE && (
              <>
                <div
                  className="cf-turnstile m-auto"
                  data-sitekey={SITE_KEY}
                  data-callback="onTurnstileBooking"
                  data-appearance="always"
                />
                <input type="hidden" name="cf-turnstile-response" />
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
