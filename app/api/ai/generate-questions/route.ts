import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { generateQuestions } from '@/lib/gemini-service';

const schema = z.object({
  subject: z.string().min(2).max(80),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  grade: z.union([z.literal(7), z.literal(8), z.literal(9)]),
  count: z.number().int().min(1).max(10),
  topic: z.string().max(80).optional()
});

export async function POST(request: Request) {
  try {
    const params = schema.parse(await request.json());
    const questions = await generateQuestions(params);
    return NextResponse.json({ questions, generated_at: new Date().toISOString(), source: questions[0]?.generatedBy ?? 'static' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Request tidak valid.' }, { status: 400 });
  }
}
