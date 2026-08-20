import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { chatWithTutor } from '@/lib/gemini-service';

const schema = z.object({
  message: z.string().min(1).max(1000),
  context: z.array(z.object({ id: z.string(), role: z.enum(['user', 'assistant']), content: z.string(), createdAt: z.string(), favorite: z.boolean().optional() })).default([]),
  studentLevel: z.number().int().min(1).max(100),
  currentSubject: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const reply = await chatWithTutor(body);
    return NextResponse.json({ reply, generated_at: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Chat request tidak valid.' }, { status: 400 });
  }
}
