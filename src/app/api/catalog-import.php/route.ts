// DEV ONLY — simulates POST /api/catalog-import.php
// Bulk-upserts parsed catalog rows into the dev price store.

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs, devProductPrices } from '@/lib/devStore';

type ImportItem = {
  product_category?: string;
  code?: string;
  price_per_meter?: number;
};

export async function POST(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, items } = await req.json() as { id?: number; items?: ImportItem[] };

  if (!id || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'id e items son requeridos' }, { status: 400 });
  }
  if (items.length > 2000) {
    return NextResponse.json({ error: 'Demasiadas filas (máx. 2000)' }, { status: 400 });
  }

  const catalog = devCatalogs.findById(id);
  if (!catalog) return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });

  let applied = 0;
  for (const item of items) {
    const cat   = item.product_category?.trim() ?? '';
    const code  = item.code?.trim() ?? '';
    const price = item.price_per_meter ?? -1;

    if (!cat || !code || price < 0) continue; // skip invalid rows

    devProductPrices.set(cat, code, price, catalog.supplier);
    applied++;
  }

  if (applied === 0) {
    return NextResponse.json({ error: 'Ninguna fila válida para importar' }, { status: 400 });
  }

  devCatalogs.markImported(id, applied);
  return NextResponse.json({ ok: true, applied });
}
