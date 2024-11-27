// src/app/productos/[id]/ProductNavigation.tsx
'use client'

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ProductNavigationProps = {
  goToNextProduct: () => void;
  goToPreviousProduct: () => void;
};

export function ProductNavigation({ goToNextProduct, goToPreviousProduct }: ProductNavigationProps) {
  return (
    <div className="flex gap-4 justify-between mt-3">
      <Button type="button" className="bg-primary text-white" onClick={goToPreviousProduct}>
        <ArrowLeft size={20} />
        Anterior
      </Button>
      <Button type="button" className="bg-primary text-white" onClick={goToNextProduct}>
        Siguiente
        <ArrowRight size={20} />
      </Button>
    </div>
  );
}
