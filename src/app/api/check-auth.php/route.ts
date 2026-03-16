// DEV ONLY — simulates /api/check-auth.php

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('dev_admin')?.value === '1';

  if (!isAdmin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, username: 'admin' });
}
