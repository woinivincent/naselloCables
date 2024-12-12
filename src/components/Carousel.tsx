"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LabelOverlay } from "./ui/label-overlay";

type ImageType = string | { url: string; label: string };

type CarouselProps = {
  images: ImageType[];
  productName: string;
};

const Carousel = ({ images, productName }: CarouselProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };

  const getImageUrl = (image: ImageType): string => {
    return typeof image === "string" ? image : image.url;
  };

  const getImageLabel = (image: ImageType): string | undefined => {
    return typeof image === "object" ? image.label : undefined;
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="object-contain relative w-full h-[800px] overflow-hidden">
        {images.map((image, index) => (
          <div key={index} className="absolute inset-0">
            <Image
              src={getImageUrl(image)}
              alt={`${productName} - Imagen ${index + 1}`}
              fill
              className={`object-contain transition-transform duration-700 ease-in-out ${
                index === activeImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            />
            {getImageLabel(image) && index === activeImageIndex && (
              <LabelOverlay label={getImageLabel(image)!} />
            )}
          </div>
        ))}
      </div>

      <ChevronLeft
        onClick={handlePrevImage}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 hover:bg-secondary opacity-80 cursor-pointer"
        aria-label="Imagen anterior"
        size={50}
      />

      <ChevronRight
        onClick={handleNextImage}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 hover:bg-secondary opacity-80 cursor-pointer"
        aria-label="Imagen siguiente"
        size={50}
      />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleImageChange(index)}
            className={`w-3 h-3 rounded-full ${
              index === activeImageIndex ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;