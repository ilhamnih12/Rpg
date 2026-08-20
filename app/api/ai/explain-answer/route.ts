import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { explainAnswer } from '@/lib/gemini-service';

const schema = z.object({ question: z.string().min(1), userAnswer: z.string().min(1), correctAnswer: z.string().min(1), subject: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const explanation = await explainAnswer(body);
    return NextResponse.json({ explanation });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Request tidak valid.' }, { status: 400 });
  }
}
