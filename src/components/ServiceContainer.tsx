"use client"

import { JSX } from "react";
import Link from "next/link";

export const ServiceContainer = (props: { services: Array<{ label: string, desc: string, icon: JSX.Element, path: string }> }) => {
  return (
    <div className="grid x-tablet:grid-cols-3 p-5 smartphone:p-10 gap-5" id="service">
      {props.services.map((service, index) => (
        <Link 
          key={index}
          href={service.path}
          className="bg-white p-6 flex items-center gap-5 group hover:border-dark-green border-white border-3 duration-300 rounded-[5px]" 
        >
          <div className="text-[2.5rem] group-hover:-translate-y-2 group-hover:text-dark-green duration-300">{service.icon}</div>
          <div className="flex flex-col gap-2 group-hover:text-dark-green">
            <h1 className="text-[1.2rem] font-bold">{service.label}</h1>
            <p className="text-[0.7rem] smartphone:text-[1rem]">{service.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}