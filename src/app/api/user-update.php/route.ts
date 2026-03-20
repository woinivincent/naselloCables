// DEV ONLY — simulates POST /api/user-update.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers, DevUserRole } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const requesterUsername = req.cookies.get('dev_admin')?.value;
  if (!requesterUsername) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id, username, email, password, role } = await req.json() as {
    id:        number;
    username?: string;
    email?:    string;
    password?: string;
    role?:     DevUserRole;
  };

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const result = devUsers.update(id, {
    ...(username && { username }),
    ...(email    && { email: email.toLowerCase().trim() }),
    ...(password && { password }),
    ...(role     && { role }),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
