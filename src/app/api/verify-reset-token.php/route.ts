// DEV ONLY — simulates GET /api/verify-reset-token.php?token=xxx

import { NextRequest, NextResponse } from 'next/server';
import { devResetTokens } from '@/lib/devStore';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });
  }

  const result = devResetTokens.verify(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: 'El enlace es inválido o ya expiró' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
