// DEV ONLY — simulates GET /api/product-files.php?category=xxx

import { NextRequest, NextResponse } from 'next/server';
import { devFiles } from '@/lib/devStore';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? '';
  if (!category) {
    return NextResponse.json({ error: 'category requerido' }, { status: 400 });
  }
  return NextResponse.json(devFiles.getByCategory(category));
}
