'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      className="relative w-full h-[63vh] overflow-hidden max-sm:h-[320px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent z-0" />
      <div ref={emblaRef} className="overflow-hidden max-sm:h-[320px]">
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] min-w-0">
              {/* Fondo visual */}
              <div className="w-full h-[600px] max-h-[63vh] relative overflow-hidden max-sm:h-[320px]">
                {slide.type === 'video' && slide.videoPath ? (
                  selectedIndex === index && (
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
                  )
                ) : (
                  <Image
                    src={slide.imagePath!}
                    alt="image"
                    fill
                    priority={index === 0}
                    className="object-cover pointer-events-none z-0"
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>

              {/* Botones clickeables */}
              {slide.type === 'image' && (
                <div className="absolute bottom-28 left-2/3 z-50 flex flex-col gap-2 pointer-events-auto">
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

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 border-white/20"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 border-white/20"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Progress Indicators */}
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