import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { generateInsights } from '@/lib/gemini-service';

const schema = z.object({ mastery: z.record(z.number()), totalQuestions: z.number(), streak: z.number() });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const insight = await generateInsights(body);
    return NextResponse.json({ insight });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Insights request tidak valid.' }, { status: 400 });
  }
}
