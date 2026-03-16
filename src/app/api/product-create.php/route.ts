// DEV ONLY — simulates /api/product-create.php

import { NextRequest, NextResponse } from 'next/server';
import { devStore } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name || !data.description || !data.category) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }

  if (devStore.findByCategory(data.category)) {
    return NextResponse.json({ error: 'Ya existe un producto con esa categoría' }, { status: 409 });
  }

  const id = devStore.create(data);
  return NextResponse.json({ ok: true, id });
}
