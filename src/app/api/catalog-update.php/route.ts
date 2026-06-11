// DEV ONLY — simulates POST /api/catalog-update.php

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, name, supplier } = await req.json() as { id?: number; name?: string; supplier?: string };

  if (!id || !name?.trim() || !supplier?.trim()) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  if (!devCatalogs.update(id, { name: name.trim(), supplier: supplier.trim() })) {
    return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
