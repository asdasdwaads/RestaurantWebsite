"use client"

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

import { BookContainer } from "@/components/BookComponents";
import { MenuPDF } from "@/components/MenuComponents";
import menu from "@/database/menu.test.json";

export default function Booking() {

  const services = [
    { label: "Eat at restaurant", htmlFor: "restaurant", id: "restaurant" },
    { label: "Take away", htmlFor: "house", id: "house" },
    { label: "Cooking at house", htmlFor: "cooking", id: "cooking" },
  ];

  const [form, setForm] = useState<{ date?: Date, name?: string, phone?: string, email?: string, count?: number }>(); 

  const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [event.target.name]: event.target.value })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log(form)
  }

  return (
    <div className="relative">
      <img
        src="/assets/booking/bg.jpeg"
        alt="Not found image"
        className="absolute w-full h-full"
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
              title: "text-white font-bold text-[2rem]" 
            }}
          >
            <MenuPDF
              menu={menu.menuPDF}
              styles={{
                container: "relative",
                image: "min-w-full box-border h-full",
                button: "text-[2rem] p-2"
              }}
            />
            <div className="text-emerald-400 font-bold flex flex-col y-tablet:flex-row items-center y-tablet:justify-between pt-4 text-[0.9rem]">
              <div>
                <Link href="/assets/menu/pdf/menu_English.pdf" target="_blank">Download the PDF for English</Link>
              </div>
              <div>
                <Link href="/assets/menu/pdf/menu_German.pdf"  target="_blank">Download the PDF for German</Link>
              </div>
            </div>
          </BookContainer>
          <BookContainer
            title="Order Details"
            styles={{ 
              container: "w-[300px] smartphone:w-[400px] y-tablet:w-[500px] justify-between", 
              title: "text-white font-bold text-[2rem]", 
              children: "grid w-full gap-5" 
            }}
          >
            <input type="date" className="bg-white w-full h-[40px] rounded-[10px] px-2" onChange={handleOnChange} />
            <input type="text" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Name" onChange={handleOnChange} />
            <input type="text" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Phone" onChange={handleOnChange} />
            <input type="email" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Email" onChange={handleOnChange} />
            <input type="number" className="bg-white w-full h-[40px] rounded-[10px] px-2" placeholder="Count" onChange={handleOnChange} />
            <textarea className="bg-white rounded-[10px] p-2 resize-none h-[300px] overflow-auto" placeholder="Enter your order details here..." onChange={handleOnChange}></textarea>
            <div className="text-white grid y-tablet:flex gap-4 y-tablet:gap-2">
              {services.map((service, index) => (
                <div className="flex items-center gap-1 w-full" key={index}>
                  <input
                    type="radio"
                    name="check"
                    id={service.id}
                    value={service.label}
                    radioGroup="check"
                    onChange={handleOnChange}
                    className="appearance-none border-2 min-w-5 min-h-5 rounded-full checked:bg-emerald-400 duration-300"
                  />
                  <label className="text-[0.8rem] y-tablet:text-[1rem] w-full text-nowrap" htmlFor={service.htmlFor}>{service.label}</label>
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} className="text-white bg-dark-green py-2 rounded-[10px] cursor-pointer" type="submit">Order now</button>
          </BookContainer>
        </div>
        <div className="flex items-center py-8 y-tablet:py-16">
          <h1 className="text-white text-[1rem] smartphone:text-[1.5rem] y-tablet:text-[2rem] font-bold">Available in</h1>
          <Link href="https://www.foodora.at/restaurant/rjxp/charm-thai" target="_blank">
            <img src="/Foodora_Logo.png" alt="Not found logo" className="w-[150px] smartphone:w-[200px] y-tablet:w-[300px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}