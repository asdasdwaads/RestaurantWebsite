"use client"

import { useState } from "react";
import { FoodProps } from "@/interfaces/food";
import { motion } from "motion/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export const MenuContainer = ({ children, title }: { children?: React.ReactNode, title?: string }) => {
  return (
    <div className="relative w-full">
      <div className="sticky top-0 p-3 bg-dark-green text-white text-center text-[1.6rem] font-bold">
        <h1>{title}</h1>
      </div>
      <div className="grid grid-cols-2 y-tablet:grid-cols-3 desktop:grid-cols-4 y-tablet:p-2 x-tablet:p-5">
        {children}
      </div>
    </div>
  );
}

export const MenuCard = (props: FoodProps) => {
  return (
    <div className="p-2 smartphone:p-5 flex flex-col items-center">
      <img
        className="min-w-[100px] smartphone:min-w-[150px] w-full h-[100px] smartphone:h-[150px] x-tablet:h-[200px] desktop:h-[250px] object-cover"
        src={props.image}
        alt="Not found image"
      />
      <div className="flex flex-col items-center text-center p-3 text-[0.7rem] smartphone:text-[1rem] x-tablet:text-[1.4rem]">
        <h1>{props.name}</h1>
        <p>€{props.price}</p>
      </div>
    </div>
  );
}

export const MenuPDF = (props: { menu: Array<{ path: string }>, styles?: { container?: string, button?: string, image?: string }, onClick?: () => void, active?: boolean }) => {

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => setCurrentIndex((currentIndex) => (currentIndex === 0 ? props.menu.length - 1 : currentIndex - 1));
  const nextSlide = () => setCurrentIndex((currentIndex) => (currentIndex === props.menu.length - 1 ? 0 : currentIndex + 1));

  return (
    <motion.div
      className={props.styles?.container}
      transition={{ duration: 0.3 }}
    >
      <div className="flex overflow-hidden">
        {props.menu?.map((pdf, index) => (
          <motion.div
            key={index}
            onClick={props.onClick}
            className={props.styles?.image}
            animate={{
              translateX: `-${currentIndex * 100}%`,
              transition: {
                duration: 1,
                ease: "easeInOut"
              }
            }}
          >
            <img
              src={pdf.path}
              alt="Not found image"
              className="cursor-pointer"
            />
          </motion.div>
        ))}
      </div>
      <div className={`absolute top-0 left-0 h-full flex items-center ${props.styles?.button}`}>
        {currentIndex !== 0 && <button onClick={prevSlide} className="px-2 py-6 cursor-pointer rounded-[10px] hover:bg-[#ffffff60] hover:shadow-2xl duration-300"><IoIosArrowBack /></button>}
      </div>
      <div className={`absolute top-0 right-0 h-full flex items-center ${props.styles?.button}`}>
        {currentIndex !== props.menu.length - 1 && <button onClick={nextSlide} className="px-2 py-6 cursor-pointer rounded-[10px] hover:bg-[#ffffff60] hover:shadow-2xl duration-300"><IoIosArrowForward /></button>}
      </div>
    </motion.div>
  );
}

export const MenuModal = ({ children, onClick, isOpen }: { children?: React.ReactNode, onClick?: () => void, isOpen?: boolean }) => {
  return (
    <motion.div
      className="fixed z-11 top-0 justify-center items-center w-screen bg-[#00000080] overflow-hidden h-screen"
      initial={{
        display: isOpen ? "flex" : "none",
        opacity: isOpen ? 1 : 0
      }}
      animate={{
        display: isOpen ? "flex" : "none",
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute top-0 right-2 smartphone:right-5 text-[2rem] m-2 smartphone:m-4 p-3 z-12 cursor-pointer rounded-full hover:bg-[#ffffff60] hover:shadow-2xl duration-300"
        onClick={onClick}
      >
        <RxCross2 />
      </div>
      <motion.div
        className="overflow-scroll [&::-webkit-scrollbar]:w-0"
        initial={{ scale: isOpen ? 0 : 1 }}
        animate={{ scale: isOpen ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}