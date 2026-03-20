// DEV ONLY — simulates /api/login.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = devUsers.findByUsername(username);
  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, username: user.username, role: user.role });
  // Store the username in the cookie so check-auth can look up the user + role
  res.cookies.set('dev_admin', user.username, {
    path:     '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   60 * 60 * 8, // 8 hours
  });
  return res;
}
