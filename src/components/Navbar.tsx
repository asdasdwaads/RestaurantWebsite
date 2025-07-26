"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {

  const pathname = usePathname();

  const options = [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" },
    { label: "Book", path: "/booking" },
    { label: "Contact", path: "/contact" },
  ];

  const handleToTop = () => {
    const element = document.getElementById("top");
    element?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="w-screen fixed flex justify-between items-center gap-2 px-2 smartphone:px-[2rem] shadow-lg z-10 bg-white">
      <div>
        <img
          src={"/logo.png"}
          alt="Not Found Logo"
          className="min-w-[80px] max-w-[80px]"
        />
      </div>
      <div className="flex justify-end items-center gap-2 smartphone:gap-5 y-tablet:gap-10 text-[1.2rem] z-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`${pathname === option.path && "bg-dark-green text-white py-1 smartphone:py-2 px-2 smartphone:px-4"} text-[0.8rem] smartphone:text-[1rem] rounded-[10px] duration-300`}
          >
            <Link href={option.path} onClick={handleToTop}>
              {option.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}