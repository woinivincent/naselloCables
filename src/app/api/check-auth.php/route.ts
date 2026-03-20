// DEV ONLY — simulates /api/check-auth.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers } from '@/lib/devStore';

export async function GET(req: NextRequest) {
  const username = req.cookies.get('dev_admin')?.value;
  if (!username) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = devUsers.findByUsername(username);
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
