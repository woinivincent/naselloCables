'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { slides } from './data';

export function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
    dragFree: true
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // 7 seconds

    return () => clearInterval(interval);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative h-[600px] overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 z-10" />
      
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slider, index) => (
            <div
              key={slider.id}
              className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center "
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={`/assets/slider${slider.id}.jpg`}
                  alt={slider.title}
                  fill
                  priority={index === 0}
                  className="object-fit"
                  sizes="1000vh"
                  quality={100}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="max-w-screen-xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                      {slider.title}
                    </h2>
                    <p className="text-lg text-white/90">
                      {slider.description}
                    </p>
                  </div>
                </div>
              </div>
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