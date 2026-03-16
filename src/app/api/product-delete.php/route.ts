// DEV ONLY — simulates /api/product-delete.php

import { NextRequest, NextResponse } from 'next/server';
import { devStore } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const numId = Number(id);

  if (!numId) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const ok = devStore.remove(numId);
  if (!ok) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
