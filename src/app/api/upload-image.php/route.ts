// DEV ONLY — simulates POST /api/upload-image.php
// Accepts multipart/form-data: subfolder (logos|productos|general), file (image)
// Optional: replace_path (relative path under public/assets/ to overwrite)
// Saves the file to public/assets/{subfolder}/ so Next.js serves it at /assets/...

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_SUBFOLDERS = ['logos', 'productos', 'general'] as const;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Formulario inválido' }, { status: 400 });
  }

  const subfolder   = (formData.get('subfolder')    as string | null)?.trim() ?? '';
  const replacePath = (formData.get('replace_path') as string | null)?.trim() ?? '';
  const file        = formData.get('file') as File | null;

  if (!ALLOWED_SUBFOLDERS.includes(subfolder as typeof ALLOWED_SUBFOLDERS[number])) {
    return NextResponse.json({ error: 'subfolder inválido. Use: logos, productos, general' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Use jpg, png, webp o svg' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 400 });
  }

  const assetsBase = path.join(process.cwd(), 'public', 'assets');

  let destPath: string;
  let url: string;

  if (replacePath) {
    // Validate no path traversal
    const normalized = path.normalize(replacePath).replace(/^(\.\.(\/|\\|$))+/, '');
    destPath = path.join(assetsBase, normalized);
    if (!destPath.startsWith(assetsBase)) {
      return NextResponse.json({ error: 'replace_path inválido' }, { status: 400 });
    }
    url = '/assets/' + normalized.replace(/\\/g, '/');
  } else {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (safeName.includes('..')) {
      return NextResponse.json({ error: 'Nombre de archivo inválido' }, { status: 400 });
    }
    const filename = `${Date.now()}_${safeName}`;
    const dir = path.join(assetsBase, subfolder);
    await mkdir(dir, { recursive: true });
    destPath = path.join(dir, filename);
    url = `/assets/${subfolder}/${filename}`;
  }

  await writeFile(destPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, url });
}
