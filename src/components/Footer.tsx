"use client"

import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";

export const Footer = () => {

  const contact = [
    { path: "", icon: <FaFacebook />, label: "example" },
    { path: "", icon: <FaXTwitter />, label: "@exmple" },
    { path: "", icon: <FaInstagram />, label: "@exmple" },
    { path: "", icon: <FaWhatsapp />, label: "+0000000000" },
  ];

  return (
    <div className="relative top-[80px] flex flex-col gap-10 justify-center items-center py-8 bg-dark">
      <div className="flex y-tablet:flex-row flex-col justify-center gap-10 text-white px-5">
        <div>
          <div className="relative y-tablet:w-[300px] before:bg-dark-green before:absolute before:w-full before:h-1 before:-bottom-2 before:rounded-full font-bold text-[1.2rem] smartphone:text-[1.6rem]">Follow Us</div>
          <div className="flex flex-col gap-6 py-8">
            {contact.map((item, index) => (
              <div key={index} className="hover:translate-x-5 duration-300 flex items-center gap-2">
                <Link href={item.path} className="flex items-center gap-3 text-[1.5rem] smartphone:text-[2rem]">
                  <div>{item.icon}</div>
                  <div className="text-[1rem] smartphone:text-[1.2rem]">
                    {item.label}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div>
          <iframe className="w-full h-[300px] y-tablet:h-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.5775725404587!2d100.1893586746136!3d16.747916320912996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30dfbe986affc42d%3A0xf04fb558f3130f0!2z4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4LiZ4LmA4Lij4Lio4Lin4Lij!5e0!3m2!1sth!2sth!4v1732068647934!5m2!1sth!2sth" />
        </div>
      </div>
    </div>
  );
}