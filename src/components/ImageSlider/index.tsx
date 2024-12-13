'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SlideData {
  id: number;
  title: string;
  description: string;
  imagePath: string;
}

interface ImageSliderProps {
  slides: SlideData[];
}

export function ImageSlider({ slides }: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 20,
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
    }, 5000);

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
      className="relative w-full h-[65vh] overflow-hidden max-sm:h-[320px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent z-10" />
      <div ref={emblaRef} className="overflow-hidden max-sm:h-[320px]">
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0">
              <div className="w-full h-[600px] max-h-[80vh] relative overflow-hidden max-sm:h-[320px]">
                <Image
                  src={slide.imagePath}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-center max-sm:h-[600px] max-sm:object-cover max-sm:object-center"
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {(slide.title || slide.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <div className="max-w-screen-xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-lg text-white/90">{slide.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-30">
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