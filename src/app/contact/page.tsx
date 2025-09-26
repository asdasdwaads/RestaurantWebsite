"use client"

import { BookContainer as ContactContainer } from "@/components/BookComponents";
import { ContactProps } from "@/interfaces/email";
import { sendEmail } from "@/lib/contact";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Contact() {

  const [form, setForm] = useState<ContactProps>();
  const [token, setToken] = useState<string | null>(null);

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  const handleSendEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget);
    formData.append("cf-turnstile-response", token || "");
    const res = await sendEmail(form);
    console.log(res);
  }

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
          <iframe className="w-full h-full rounded-[10px]" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d675.441249820311!2d15.094200543816525!3d47.377504924512905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4771df8f52936ca5%3A0xec94f616321ecf92!2sCharm%20Thai%20Restaurant!5e0!3m2!1sth!2sth!4v1758546578365!5m2!1sth!2sth" />
        </div>
        <div className="w-[300px] smartphone:w-[400px] y-tablet:w-[500px]">
          <ContactContainer
            title="Feedback"
            styles={{ container: "w-full h-screen x-tablet:h-[80vh]", title: "text-white font-bold text-[2rem]", children: "grid w-full gap-5" }}
            onSubmit={handleSendEmail}
          >
            <input type="text" name="name" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Name" onChange={handleOnChange} />
            <input type="email" name="email" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Email" onChange={handleOnChange} />
            <input type="text" name="subject" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Subject" onChange={handleOnChange} />
            <textarea name="message" className="bg-white rounded-[10px] p-2 resize-none overflow-auto h-[250px]" placeholder="Message" onChange={handleOnChange}></textarea>
            {/* Turnstile */}
            <div
              className="cf-turnstile m-auto"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-callback={(token: string) => setToken(token)}
              data-appearance="always"
            ></div>
            <button className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer w-full pb-2" type="submit">Send Message</button>
            <script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              async
              defer
            ></script>
          </ContactContainer>
        </div>
      </div>
    </div>
  )
}