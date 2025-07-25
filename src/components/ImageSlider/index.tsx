'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SlideData {
  id: number;
  type: 'image' | 'video';
  imagePath?: string;
  videoPath?: string;
  title?: string;
  description?: string;
  textPosition?: 'center' | 'left' | 'right';
}

interface ImageSliderProps {
  slides: SlideData[];
}

export function ImageSlider({ slides }: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 31,
    dragFree: true
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;

    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 31000);

    return () => clearInterval(intervalId);
  }, [emblaApi, isPaused]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    handleSelect();
    emblaApi.on('select', handleSelect);

    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi]);

  return (
    <div
      className="w-full relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent z-0" />

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="relative flex-[0_0_100%] min-w-0">
              {/* Fondo visual */}
              {slide.type === 'video' && slide.videoPath && selectedIndex === index ? (
                <div className="w-full h-[500px] max-h-[63vh] relative overflow-hidden max-sm:h-[320px]">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover absolute top-0 left-0 pointer-events-none z-0"
                  >
                    <source src={slide.videoPath} type="video/mp4" />
                  </video>
                </div>
              ) : slide.type === 'image' && slide.imagePath ? (
                <div className="relative w-full overflow-hidden">
                  <Image
                    src={slide.imagePath}
                    alt="image"
                    width={1200}
                    height={405}
                    className="w-full h-auto object-contain pointer-events-none z-0"
                    priority={index === 0}
                    quality={100}
                    sizes="100vw"
                  />
                </div>
              ) : null}

              {/* Botones clickeables (solo en desktop) */}
              {slide.type === 'image' && (
                <div className="absolute bottom-28 left-2/3 z-50 gap-2 pointer-events-auto hidden lg:flex flex-col">
                  {slide.id === 3 && (
                    <Button
                      asChild
                      className="w-6 h-6 aspect-square p-0 bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center text-[14px] font-bold z-50 pointer-events-auto"
                    >
                      <a href="/productos">+</a>
                    </Button>
                  )}
                  {slide.id === 4 && (
                    <Button
                      asChild
                      className="w-6 h-6 aspect-square p-0 bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center text-[14px] font-bold z-50 pointer-events-auto"
                    >
                      <a href="/calidad">+</a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de progreso */}
      <div className="absolute bottom-8 left-8 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              selectedIndex === index
                ? 'w-8 bg-white'
                : 'w-4 bg-white/40 hover:bg-white/60'
            )}
          />
        ))}
      </div>
    </div>
  );
}