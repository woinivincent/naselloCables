// DEV ONLY — simulates POST /api/catalog-create.php

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { name, supplier } = await req.json() as { name?: string; supplier?: string };

  if (!name?.trim() || !supplier?.trim()) {
    return NextResponse.json({ error: 'Nombre y proveedor son requeridos' }, { status: 400 });
  }

  const entry = devCatalogs.create({ name: name.trim(), supplier: supplier.trim() });
  return NextResponse.json({ ok: true, id: entry.id });
}
