'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProductNavigationClient({ nextId, prevId }: { nextId: string; prevId: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-4 justify-between mt-3">
      <Button
        type="button"
        className="bg-transparent text-primary hover:text-secondary font-extrabold"
        onClick={() => router.push(`/productos/${prevId}`)}
      >
        <ChevronLeft size={30}  />
        ANTERIOR
      </Button>

      <Button
        type="button"
        className="bg-transparent text-primary hover:text-secondary font-extrabold"
        onClick={() => router.push(`/productos/${nextId}`)}
      >
        SIGUIENTE
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}