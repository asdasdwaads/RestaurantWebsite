"use client"

import { useEffect, useState } from "react";
import { FaTruck } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { GiForkKnifeSpoon } from "react-icons/gi";

import { SliderImage } from "@/components/SliderImage";
import { ServiceContainer } from "@/components/ServiceContainer";
import { getImage } from "@/lib/image";

export default function Home() {

  const [images, setImages] = useState<{ home: Array<{ path: string }> }>({ home: [] });

  const services = [
    { label: "delivery", desc: "Join us for a meal to remember—reserve your spot!", icon: <FaTruck />, path: "/" },
    { label: "menu", desc: "Reserve today and indulge in fresh, delicious flavors!", icon: <FaBowlFood />, path: "/menu" },
    { label: "booking", desc: "Book your table now for an unforgettable dining experience!", icon: <GiForkKnifeSpoon />, path: "/booking" },
  ];

  useEffect(() => {
    getImage().then((result) => setImages(result));
  }, []);

  return (
    <div>
      <div className="relative">
        <SliderImage images={images.home} />
      </div>
      <div className="p-5 smartphone:p-10 flex flex-col items-center justify-center">
        <h1 className="smartphone:p-10 text-[3rem] smartphone:text-[5rem] font-bold text-center">About us</h1>
        <div className="relative w-full flex justify-center">
          <img
            className="p-5 smartphone:p-10 shadow-lg"
            src="/assets/home/Thai-poster.jpg"
            alt="Not found Image"
          />
          <div className="absolute flex items-center top-0 w-full h-full">
            <h1 className="mix-blend-screen font-bold text-center bg-white text-[1.2rem] y-tablet:text-[3rem] h-fit w-full p-1 smartphone:p-[1rem]">
              Best foods in the world.
            </h1>
          </div>
        </div>
        <div className="pt-5 y-tablet:p-[4rem] grid gap-4">
          <h1 className="smartphone:text-[2rem] font-bold">why choose us?</h1>
          <p className="text-gray-400 text-[0.8rem] smartphone:text-[1rem]">
            Entdecke die Aromen Thailands in Leoben
          </p>
          <p className="text-gray-400 text-[0.8rem] smartphone:text-[1rem]">
            Thailändisches Essen ist bekannt für seine Vielfalt an Aromen und die perfekte Balance zwischen süß,
            sauer, salzig und scharf. Typische Zutaten wie frische Kräuter, Kokosmilch, Zitronengras und Chili
            verleihen den Gerichten ihren einzigartigen Geschmack. Beliebte Speisen wie Pad Thai, grüne Currys oder
            Tom Yum Suppe sind nicht nur köstlich, sondern auch leicht und gesund. Für Österreicherinnen und Österreicher
            bietet die thailändische Küche eine spannende Abwechslung zu traditionellen Gerichten – und bald gibt es diese
            authentischen Spezialitäten auch direkt in Leoben zu genießen.
          </p>
        </div>
      </div>
      <div className="bg-gray-300">
        <ServiceContainer services={services} />
      </div>
    </div>
  );
}
