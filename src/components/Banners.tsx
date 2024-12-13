"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const upcomingProducts = [
    {
        id: 1,


        image: "/assets/banner2.jpeg",
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
        <div className="relative h-[300px] w-full overflow-hidden max-sm:bg-white max-sm:h-[100px] ">
            {upcomingProducts.map((product, index) => (
                <div
                    key={product.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="relative h-full w-full">
                        <Image
                            src={product.image}
                            alt="bannerImage"
                            fill
                            className="zoom-out-150 object-center max-sm:object-fill "
                            sizes="1vw"
                            quality={100}
                        />

                    </div>
                </div>
            ))}
        </div>
    );
}