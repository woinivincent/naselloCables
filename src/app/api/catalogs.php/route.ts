// DEV ONLY — simulates GET /api/catalogs.php

import { NextRequest, NextResponse } from 'next/server';
import { devCatalogs } from '@/lib/devStore';

export async function GET(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  return NextResponse.json(devCatalogs.getAll());
}
