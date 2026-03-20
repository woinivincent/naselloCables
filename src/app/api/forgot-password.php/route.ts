// DEV ONLY — simulates POST /api/forgot-password.php
// Does NOT send email. Logs the reset link to the terminal instead.

import { NextRequest, NextResponse } from 'next/server';
import { devUsers, devResetTokens } from '@/lib/devStore';

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const user = devUsers.findByEmail(email.toLowerCase().trim());

  // Always return ok — don't reveal whether the email exists
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token     = devResetTokens.create(user.id);
  const resetLink = `http://localhost:3000/admin/reset-password?token=${token}`;

  // In dev: print the link to the terminal so you can test without real email
  console.log('\n[DEV] Password reset link for', user.username, ':');
  console.log(resetLink, '\n');

  return NextResponse.json({ ok: true });
}
