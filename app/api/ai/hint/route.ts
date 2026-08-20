import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { generateHint } from '@/lib/gemini-service';

const questionSchema = z.object({
  id: z.string(), subject: z.string(), topic: z.string(), difficulty: z.enum(['easy', 'medium', 'hard']), grade: z.union([z.literal(7), z.literal(8), z.literal(9)]), question: z.string(), options: z.array(z.string()), correctAnswer: z.number(), explanation: z.string(), hints: z.array(z.string()), rewards: z.object({ xp: z.number(), gold: z.number() }), generatedBy: z.enum(['ai', 'static']), createdAt: z.string(), type: z.enum(['multiple_choice', 'short_answer', 'true_false']).optional()
});
const schema = z.object({ question: questionSchema, previousHints: z.array(z.string()).default([]), creativity: z.number().min(0).max(100) });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const hint = await generateHint(body);
    return NextResponse.json({ hint });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Hint request tidak valid.' }, { status: 400 });
  }
}
