// DEV ONLY — simulates POST /api/catalog-upload.php
// multipart/form-data: id (catalog id), file (PDF/Excel/CSV)
// Saves the file to public/uploads/catalogs/ as catalog_{id}.{ext}

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs } from '@/lib/devStore';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const ALLOWED_EXTS = ['pdf', 'xlsx', 'csv'];

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Formulario inválido' }, { status: 400 });
  }

  const id   = parseInt((formData.get('id') as string | null) ?? '0', 10);
  const file = formData.get('file') as File | null;

  if (!id) return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  if (!file) return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });

  const catalog = devCatalogs.findById(id);
  if (!catalog) return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTS.includes(ext)) {
    return NextResponse.json({ error: 'Solo se permiten archivos PDF, Excel (.xlsx) o CSV' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera los 10 MB' }, { status: 400 });
  }

  const filename  = `catalog_${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'catalogs');

  await mkdir(uploadDir, { recursive: true });

  // Remove previous file if the extension changed
  if (catalog.file_url && !catalog.file_url.endsWith(filename)) {
    const oldName = catalog.file_url.split('/').pop()!;
    await unlink(path.join(uploadDir, oldName)).catch(() => {});
  }

  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const fileUrl = `/uploads/catalogs/${filename}`;
  devCatalogs.update(id, { file_url: fileUrl });

  return NextResponse.json({ ok: true, file_url: fileUrl });
}
