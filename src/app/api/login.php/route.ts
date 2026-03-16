// DEV ONLY — simulates /api/login.php
// In production this route is never hit; the real PHP file handles it.
// Credentials: admin / admin123

import { NextRequest, NextResponse } from 'next/server';

const DEV_USER = 'admin';
const DEV_PASS = 'admin123';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username !== DEV_USER || password !== DEV_PASS) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, username });
  res.cookies.set('dev_admin', '1', { path: '/', httpOnly: false, sameSite: 'lax' });
  return res;
}
