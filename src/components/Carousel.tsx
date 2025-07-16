
'use client';

import Image from "next/image";
import { useState } from "react";

interface CarouselProps {
  images: (string | { url: string; label?: string })[];
  productName: string;
}

export default function Carousel({ images, productName }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[current];
  const src = typeof currentImage === 'string' ? currentImage : currentImage.url;
  const alt = typeof currentImage === 'string' ? productName : currentImage.label || productName;

  return (
    <div className="relative w-full max-w-[500px] h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden mx-auto lg:mx-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-fit"
        sizes="(max-width: 768px) 100vw, 700px"
      />
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-400 text-white w-8 h-8 flex items-center justify-center rounded-full text-2xl"
      >
        ‹
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-400 text-white w-8 h-8 flex items-center justify-center rounded-full text-2xl"
      >
        ›
      </button>
    </div>
  );
}