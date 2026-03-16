// DEV ONLY — simulates /api/logout.php

import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dev_admin', '', { path: '/', maxAge: 0 });
  return res;
}
