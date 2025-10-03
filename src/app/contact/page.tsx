"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BookContainer as ContactContainer } from "@/components/BookComponents";

type ContactForm = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

declare global {
  interface Window {
    onTurnstileContact?: (t: string) => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_CONTACT!;
const ENABLE_TURNSTILE =
  !!SITE_KEY && process.env.NEXT_PUBLIC_TURNSTILE_ENABLE !== "0";

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({});
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!ENABLE_TURNSTILE) return;
    (window as any).onTurnstileContact = (t: string) => {
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

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const fd = new FormData(e.currentTarget);
      if (ENABLE_TURNSTILE) {
        const token = (fd.get("cf-turnstile-response") as string) || "";
        if (!token) {
          setMsg("Please complete the CAPTCHA.");
          setSubmitting(false);
          return;
        }
      }
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setMsg("Message sent! Thank you.");
      setForm({});
      const inp = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="cf-turnstile-response"]'
      );
      if (inp) inp.value = "";
    } catch (err: any) {
      setMsg(`❌ ${err.message || "Send failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContactContainer
      // @ts-ignore — ให้ส่ง ref ลงไปยัง <form> ภายในคอมโพเนนต์
      ref={formRef}
      title="Feedback"
      styles={{
        container: "w-full h-screen x-tablet:h-[80vh]",
        title: "text-white font-bold text-[2rem]",
        children: "grid w-full gap-5",
      }}
      onSubmit={onSubmit}
    >
      <input
        type="text"
        name="name"
        className="bg-white w-full h-[40px] rounded-[10px] px-2"
        placeholder="Name"
        onChange={onChange}
        required
        value={form.name || ""}
      />
      <input
        type="email"
        name="email"
        className="bg-white w-full h-[40px] rounded-[10px] px-2"
        placeholder="Email"
        onChange={onChange}
        required
        value={form.email || ""}
      />
      <input
        type="text"
        name="subject"
        className="bg-white w-full h-[40px] rounded-[10px] px-2"
        placeholder="Subject"
        onChange={onChange}
        required
        value={form.subject || ""}
      />
      <textarea
        name="message"
        className="bg-white rounded-[10px] p-2 resize-none overflow-auto h-[250px]"
        placeholder="Message"
        onChange={onChange}
        required
        value={form.message || ""}
      ></textarea>

      {/* Hidden token + widget */}
      {ENABLE_TURNSTILE && (
        <>
          <div
            className="cf-turnstile m-auto"
            data-sitekey={SITE_KEY}
            data-callback="onTurnstileContact"
            data-appearance="always"
          />
          <input type="hidden" name="cf-turnstile-response" />
        </>
      )}

      <button
        className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer w-full pb-2 disabled:opacity-60"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>

      {msg && <p className="text-center text-white font-semibold">{msg}</p>}
    </ContactContainer>
  );
}
