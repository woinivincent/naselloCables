// DEV ONLY — simulates POST /api/catalog-delete.php

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await req.json() as { id?: number };

  if (!id) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  if (!devCatalogs.remove(id)) {
    return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
