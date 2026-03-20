// DEV ONLY — simulates POST /api/upload-file.php
// Accepts multipart/form-data: category, label, file (PDF)
// Saves the file to public/uploads/technical_files/ so Next.js serves it at /uploads/...

import { NextRequest, NextResponse } from 'next/server';
import { devFiles } from '@/lib/devStore';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

  const category = (formData.get('category') as string | null)?.trim() ?? '';
  const label    = (formData.get('label')    as string | null)?.trim() ?? '';
  const file     = formData.get('file') as File | null;

  if (!category || !label) {
    return NextResponse.json({ error: 'category y label son requeridos' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera los 10 MB' }, { status: 400 });
  }

  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return NextResponse.json({ error: 'Nombre de archivo inválido' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${category}_${Date.now()}_${safeName}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'technical_files');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/technical_files/${filename}`;
  const entry = devFiles.create({ product_category: category, label, url });

  return NextResponse.json({ ok: true, id: entry.id, url: entry.url });
}
