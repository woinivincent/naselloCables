'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButtonClient() {
  const router = useRouter();

  return (
    <Button
      variant="default"
      onClick={() => router.push('/productos')}
      className="flex items-center bg-primary gap-2 text-xs hover:text-white hover:bg-secondary "
    >
      
      VOLVER A PRODUCTOS
    </Button>
  );
}