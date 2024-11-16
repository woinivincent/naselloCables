"use client"

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BackToTopProps {
  className?: string;
  threshold?: number;
}

const BackToTop = ({ className, threshold = 400 }: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed right-4 bottom-4 transition-all duration-300 shadow-lg",
        "hover:bg-primary hover:text-primary-foreground",
        !isVisible && "translate-y-[200%] opacity-0",
        isVisible && "translate-y-0 opacity-100",
        className
      )}
      onClick={scrollToTop}
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};

export default BackToTop;