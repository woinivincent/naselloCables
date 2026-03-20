// DEV ONLY — simulates POST /api/price-save.php

import { NextRequest, NextResponse } from 'next/server';
import { devProductPrices } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { product_category, code, price_per_meter, supplier } = await req.json() as {
    product_category: string; code: string; price_per_meter: number; supplier?: string;
  };

  if (!product_category || !code || price_per_meter === undefined || price_per_meter < 0)
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  devProductPrices.set(product_category, code, price_per_meter, supplier);
  return NextResponse.json({ ok: true });
}
