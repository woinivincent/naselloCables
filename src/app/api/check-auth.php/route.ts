// DEV ONLY — simulates /api/check-auth.php

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // req.cookies is the correct API for reading cookies in Route Handlers
  const isAdmin = req.cookies.get('dev_admin')?.value === '1';

  if (!isAdmin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, username: 'admin' });
}
