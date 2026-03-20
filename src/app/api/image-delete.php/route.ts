// DEV ONLY — simulates POST /api/image-delete.php
// Body: { "path": "logos/logo.png" } — relative to public/assets/
// Deletes the file from the filesystem. Prevents path traversal.

import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { path: relPath } = await req.json() as { path: string };

  if (!relPath || typeof relPath !== 'string') {
    return NextResponse.json({ error: 'path requerido' }, { status: 400 });
  }

  const assetsBase = path.join(process.cwd(), 'public', 'assets');
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath   = path.join(assetsBase, normalized);

  if (!fullPath.startsWith(assetsBase)) {
    return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
  }

  const ext = path.extname(fullPath).toLowerCase().slice(1);
  if (!['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return NextResponse.json({ error: 'Solo se pueden eliminar imágenes' }, { status: 400 });
  }

  try {
    await unlink(fullPath);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado o no se pudo eliminar' }, { status: 404 });
  }
}
