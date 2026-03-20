// DEV ONLY — simulates GET /api/product-prices.php

import { NextRequest, NextResponse } from 'next/server';
import { devProductPrices } from '@/lib/devStore';

export async function GET(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const category = req.nextUrl.searchParams.get('category');
  const data = category
    ? devProductPrices.getByCategory(category)
    : devProductPrices.getAll();

  return NextResponse.json(data);
}
