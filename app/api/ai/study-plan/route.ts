import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { generateStudyPlan } from '@/lib/gemini-service';

const schema = z.object({ weakSubjects: z.array(z.string()).default([]), availableTime: z.number().int().min(10).max(240), examDate: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const plan = await generateStudyPlan(body);
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Study plan request tidak valid.' }, { status: 400 });
  }
}
