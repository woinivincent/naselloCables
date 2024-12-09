"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const upcomingProducts = [
    {
        id: 1,


        image: "/assets/solar.png",
    },
    {
        id: 2,
        image: "/assets/banner1.jpeg",
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
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="relative h-full w-full">
                        <Image
                            src={product.image}
                            alt="bannerImage"
                            fill
                            className="opacity-75 zoom-out-150 object-center"
                            sizes="1vw"
                            quality={90}
                        />

                    </div>
                </div>
            ))}
        </div>
    );
}