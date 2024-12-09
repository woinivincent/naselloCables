"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const upcomingProducts = [
  {
    id: 1,
    title: "Cable Solar",
    description:"La alternativa para seguir transmitiendo energía en un futuro sustentable",
    image: "/assets/solar.png",
  },
  {
    id: 2,
    title: "Cable acometida aereo",
    description:"Ideal para llevar energia desde el exterior a los domicilios",
    image: "/assets/banner2.jpeg",
  },

];

export function Banners() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % upcomingProducts.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[300px] w-full overflow-hidden bg-gray-900 ">
      {upcomingProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full w-full">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="opacity-50 zoom-out-150 object-center"    
              sizes="1vw"
              quality={90}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-center text-3xl font-bold">
                {product.title}
                <span className="mt-2 block text-xl font-normal">
                  {product.description} <br />
                  Proximamente
                </span>
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}