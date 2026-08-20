import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { dailyQuestsFor } from '@/lib/static-data';
import { todayKey } from '@/lib/utils';

export async function GET() {
  const date = todayKey();
  return NextResponse.json({ date, quests: dailyQuestsFor(date), generated_at: new Date().toISOString() });
}
