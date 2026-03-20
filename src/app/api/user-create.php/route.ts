// DEV ONLY — simulates POST /api/user-create.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers, DevUserRole } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const { username, email, password, role } = await req.json() as {
    username: string;
    email:    string;
    password: string;
    role:     DevUserRole;
  };

  if (!username || !email || !password || !role) {
    return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 });
  }

  const result = devUsers.create({ username, email: email.toLowerCase().trim(), password, role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
