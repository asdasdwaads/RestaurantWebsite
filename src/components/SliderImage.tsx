"use client"

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export const SliderImage = (props: { images: Array<{ path: string }> }) => {

  const len = props.images.length - 1;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => setCurrentIndex(currentIndex === 0 ? len : currentIndex - 1);
  const nextSlide = () => setCurrentIndex(currentIndex === len ? 0 : currentIndex + 1);
  
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  return (
    <div className="relative flex overflow-hidden h-[300px] y-tablet:h-[400px] x-tablet:h-[700px]">
      {props.images?.map((image, index) => (
        <motion.div
          key={index}
          className="box-border min-w-full object-cover"
          animate={{
            translateX: `-${currentIndex * 100}%`,
            transition: {
              duration: 1,
              ease: "easeInOut"
            }
          }}
        >
          <img
            src={image.path}
            alt="Not Found Image"
            className="h-full w-full object-cover"
          />
        </motion.div>
      ))}
      <div className="absolute left-0 h-full flex items-center justify-center px-4">
        <div onClick={prevSlide} className="text-[3rem] p-1 y-tablet:p-2 cursor-pointer rounded-full hover:bg-[#ffffff60] hover:shadow-2xl duration-300"><IoIosArrowBack /></div>
      </div>
      <div className="absolute right-0 h-full flex items-center justify-center px-4">
        <div onClick={nextSlide} className="text-[3rem] p-1 y-tablet:p-2 cursor-pointer rounded-full hover:bg-[#ffffff60] hover:shadow-2xl duration-300"><IoIosArrowForward /></div>
      </div>
      <div className="absolute flex w-screen justify-center bottom-[2rem] gap-5 z-5">
        {props.images?.map((_, index) => (
          <motion.div
            key={index}
            className="p-1 y-tablet:p-2 rounded-full bg-white cursor-pointer"
            animate={{ width: currentIndex === index ? "50px" : 0 }}
            transition={{ duration: 1 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}