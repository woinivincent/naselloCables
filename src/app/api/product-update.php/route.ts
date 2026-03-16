// DEV ONLY — simulates /api/product-update.php

import { NextRequest, NextResponse } from 'next/server';
import { devStore } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const id   = Number(data.id);

  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  if (!data.name || !data.description || !data.category) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }

  const dup = devStore.findByCategory(data.category);
  if (dup && dup.id !== id) {
    return NextResponse.json({ error: 'Ya existe otro producto con esa categoría' }, { status: 409 });
  }

  const ok = devStore.update(id, data);
  if (!ok) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
