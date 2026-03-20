// DEV ONLY — simulates POST /api/reset-password.php

import { NextRequest, NextResponse } from 'next/server';
import { devUsers, devResetTokens } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json() as { token: string; password: string };

  if (!token || !password || password.length < 6) {
    return NextResponse.json(
      { error: 'Token y contraseña requeridos (mínimo 6 caracteres)' },
      { status: 400 },
    );
  }

  const verified = devResetTokens.verify(token);
  if (!verified.ok || verified.userId === undefined) {
    return NextResponse.json({ error: 'El enlace es inválido o ya expiró' }, { status: 400 });
  }

  // Update password in devStore
  devUsers.update(verified.userId, { password });

  // Consume the token so it can't be reused
  devResetTokens.consume(token);

  return NextResponse.json({ ok: true });
}
