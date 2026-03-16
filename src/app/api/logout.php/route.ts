// DEV ONLY — simulates /api/logout.php

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('dev_admin');
  return NextResponse.json({ ok: true });
}
