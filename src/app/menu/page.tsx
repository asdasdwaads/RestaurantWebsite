"use client"

import { useEffect, useState } from "react";
import { MenuCard, MenuContainer, MenuModal, MenuPDF } from "@/components/MenuComponents";
import { getMenu } from "@/lib/menu";

export default function Menu() {

  const [isOpen, toggleModal] = useState(false);
  const [menu, setMenu] = useState<{ allMenu: Array<{ category: string, menu: Array<{ name: string, price: string, path: string }> }>, menuPDF: Array<{ path: string }> }>({
    allMenu: [],
    menuPDF: [],
  });

  useEffect(() => {
    getMenu().then((result) => setMenu(result));
  }, []);

  return (
    <div>
      <div className="relative after:content-['MENU'] after:mix-blend-screen after:absolute after:bg-white after:font-bold 
          after:text-center after:text-[5rem] after:top-70 after:p-6 after:w-full">
        <img
          className="w-full h-[calc(100vh-80px)] object-cover"
          src="/assets/menu/bg.jpeg"
          alt="Not found image"
        />
      </div>
      <div
        className="flex flex-col items-center m-5 smartphone:m-15 y-tablet:m-20 h-[90vh] overflow-x-auto border-2 border-white-smoke 
        [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:bg-white-smoke [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {menu?.allMenu.map((section, index) => (
          <MenuContainer key={index} title={section.category}>
            {section.menu.map((item, index) => (
              <MenuCard key={index} image={item.path} name={item.name} price={item.price} />
            ))}
          </MenuContainer>
        ))}
      </div>
      <div className="relative flex justify-center px-5 smartphone:px-10">
        <MenuPDF
          onClick={() => toggleModal(!isOpen)}
          menu={menu?.menuPDF}
          styles={{
            container: "relative w-[500px] pb-20",
            image: "min-w-full box-border h-full",
            button: "text-[2rem] p-2"
          }}
        />
      </div>
      <MenuModal isOpen={isOpen} onClick={() => toggleModal(!isOpen)}>
        <MenuPDF
          menu={menu?.menuPDF}
          styles={{
            container: "w-screen y-tablet:w-[600px] h-full flex items-center",
            image: "min-w-full box-border h-full",
            button: "text-[2rem] p-2 smartphone:p-8"
          }}
        />
      </MenuModal>
    </div>
  );
}