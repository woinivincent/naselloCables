// DEV ONLY — simulates GET /api/users.php

import { NextResponse } from 'next/server';
import { devUsers } from '@/lib/devStore';

export async function GET() {
  return NextResponse.json(devUsers.getAll());
}
