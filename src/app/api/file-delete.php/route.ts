// DEV ONLY — simulates POST /api/file-delete.php

import { NextRequest, NextResponse } from 'next/server';
import { devFiles } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await req.json() as { id: number };
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const ok = devFiles.remove(id);
  if (!ok) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
