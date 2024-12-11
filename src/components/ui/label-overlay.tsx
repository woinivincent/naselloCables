"use client";

import { cn } from "@/lib/utils";

interface LabelOverlayProps {
  label: string;
  className?: string;
}

export function LabelOverlay({ label, className }: LabelOverlayProps) {
  return (
    <div 
      className={cn(
        "absolute top-4 right-4 bg-primary/90 text-black px-3 py-1 rounded-md text-sm font-medium shadow-md",
        className
      )}
    >
      {label}
    </div>
  );
}