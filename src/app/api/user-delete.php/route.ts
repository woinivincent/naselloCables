// DEV ONLY — simulates POST /api/user-delete.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const requesterUsername = req.cookies.get('dev_admin')?.value;
  if (!requesterUsername) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await req.json() as { id: number };

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const requester = devUsers.findByUsername(requesterUsername);
  if (!requester) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const result = devUsers.remove(id, requester.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
