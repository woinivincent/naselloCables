// DEV ONLY — simulates POST /api/calculate-order.php (public)
// Input:  { items: [{ category, code, quantity, presentation }] }
// Output: { total, is_wholesale }

import { NextRequest, NextResponse } from 'next/server';
import { devProductPrices } from '@/lib/devStore';

const WHOLESALE_THRESHOLD = 3_000_000;

function metersPerPack(presentation: string): number {
  const m = presentation.match(/(\d+)\s*(?:mts?)\b/i);
  if (m) return Number(m[1]);
  const p = presentation.toLowerCase();
  if (p.includes('bobinita')) return 300;
  if (p.includes('bobina'))   return 1000;
  if (p.includes('rollo'))    return 100;
  return 100;
}

export async function POST(req: NextRequest) {
  const { items } = await req.json() as {
    items: { category: string; code: string; quantity: number; presentation: string }[];
  };

  if (!items?.length) return NextResponse.json({ total: 0, is_wholesale: false });

  let total = 0;
  for (const item of items) {
    const meters    = metersPerPack(item.presentation);
    const unitPrice = devProductPrices.getPrice(item.category, item.code);
    total += unitPrice * meters * item.quantity;
  }

  return NextResponse.json({
    total:        Math.round(total * 100) / 100,
    is_wholesale: total > WHOLESALE_THRESHOLD,
  });
}
