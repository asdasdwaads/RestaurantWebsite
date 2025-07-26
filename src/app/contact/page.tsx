"use client"

import { BookContainer as ContactContainer } from "@/components/BookComponents";
import { EmailProps } from "@/interfaces/email";
import { sendEmail } from "@/lib/contact";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Contact() {

  const [form, setForm] = useState<EmailProps>();

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  const handleSendEmail = (event: FormEvent) => {
    event.preventDefault()
    sendEmail(form);
  }

  return (
    <div className="relative">
      <img
        src="/assets/contact/bg.jpeg"
        alt="Not found image"
        className="absolute w-full h-full"
      />
      <div className="relative flex flex-wrap-reverse justify-center gap-5 py-10 bg-[#00000091]">
        <div className="w-[300px] smartphone:w-[400px] y-tablet:w-[500px] h-[60vh] smartphone:h-[80vh]">
          <iframe className="w-full h-full rounded-[10px]" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.5775725404587!2d100.1893586746136!3d16.747916320912996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30dfbe986affc42d%3A0xf04fb558f3130f0!2z4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4LiZ4LmA4Lij4Lio4Lin4Lij!5e0!3m2!1sth!2sth!4v1732068647934!5m2!1sth!2sth" />
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
            <button className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer w-full pb-2" type="submit">Send Message</button>
          </ContactContainer>
        </div>
      </div>
    </div>
  )
}