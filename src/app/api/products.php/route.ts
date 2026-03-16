// DEV ONLY — simulates /api/products.php
// Reads from the in-memory dev store (initialized from cable_catalog.json).

import { NextResponse } from 'next/server';
import { devStore } from '@/lib/devStore';

export async function GET() {
  return NextResponse.json(devStore.getAll());
}
