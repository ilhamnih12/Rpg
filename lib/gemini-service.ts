import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { Difficulty, Grade, Message, Question, StudyPlan } from './types';
import { fallbackQuestions, SUBJECT_TOPICS } from './static-data';
import { sanitizeText, uid } from './utils';

const MODEL_NAME = 'gemini-pro';
const MAX_PER_MINUTE = 60;
const cache = new Map<string, { value: unknown; expiresAt: number }>();
const requestTimes: number[] = [];
let queue: Promise<unknown> = Promise.resolve();

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
}

function model() {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: MODEL_NAME, safetySettings });
}

async function throttle() {
  const now = Date.now();
  while (requestTimes.length && now - requestTimes[0] > 60_000) requestTimes.shift();
  if (requestTimes.length >= MAX_PER_MINUTE) {
    const wait = 60_000 - (now - requestTimes[0]) + 250;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  requestTimes.push(Date.now());
}

async function withRateLimit<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    await throttle();
    return retry(task);
  });
  queue = run.catch(() => undefined);
  return run;
}

async function retry<T>(task: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try { return await task(); } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 650 * Math.pow(2, i)));
    }
  }
  throw lastError;
}

function cached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.value as T;
}

function setCache<T>(key: string, value: T, minutes = 30) {
  cache.set(key, { value, expiresAt: Date.now() + minutes * 60_000 });
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(raw);
}

function normalizeQuestion(input: Record<string, unknown>, params: GenerateQuestionParams, index: number): Question {
  const rawOptions = Array.isArray(input.options) ? input.options.map(String).slice(0, 4) : [];
  const options = rawOptions.length === 4 ? rawOptions.map((option, i) => (/^[A-D]\./.test(option) ? option : `${String.fromCharCode(65 + i)}. ${option}`)) : fallbackQuestions({ ...params, count: 1 })[0].options;
  const correct = Number(input.correctAnswer);
  return {
    id: uid('aiq'),
    subject: sanitizeText(String(input.subject || params.subject), 80),
    topic: sanitizeText(String(input.topic || params.topic || 'Campuran'), 80),
    difficulty: params.difficulty,
    grade: params.grade,
    question: sanitizeText(String(input.question || 'Pertanyaan tidak terbaca.'), 600),
    options,
    correctAnswer: Number.isInteger(correct) && correct >= 0 && correct < 4 ? correct : 0,
    explanation: sanitizeText(String(input.explanation || 'Pembahasan belum tersedia.'), 900),
    hints: Array.isArray(input.hints) ? input.hints.map((hint) => sanitizeText(String(hint), 240)).slice(0, 2) : ['Ingat konsep dasar topik ini.', 'Eliminasi jawaban yang jelas kurang tepat.'],
    rewards: { xp: params.difficulty === 'easy' ? 25 : params.difficulty === 'medium' ? 40 : 60, gold: params.difficulty === 'easy' ? 12 : params.difficulty === 'medium' ? 20 : 30 },
    generatedBy: 'ai',
    createdAt: new Date().toISOString(),
    type: 'multiple_choice'
  };
}

export interface GenerateQuestionParams {
  subject: string;
  difficulty: Difficulty;
  grade: Grade;
  count: number;
  topic?: string;
}

export async function generateQuestions(params: GenerateQuestionParams): Promise<Question[]> {
  const safeParams = { ...params, count: Math.min(Math.max(params.count, 1), 10), topic: sanitizeText(params.topic ?? '', 80) };
  const key = `questions:${JSON.stringify(safeParams)}`;
  const hit = cached<Question[]>(key);
  if (hit) return hit;
  const ai = model();
  if (!ai) return fallbackQuestions(safeParams);
  const prompt = `
Kamu adalah AI pembuat soal untuk siswa SMP Indonesia.

Generate ${safeParams.count} soal pilihan ganda untuk:
- Mata Pelajaran: ${safeParams.subject}
- Topik: ${safeParams.topic || 'campuran sesuai mata pelajaran'}
- Tingkat Kesulitan: ${safeParams.difficulty}
- Kelas: ${safeParams.grade} SMP

Requirements:
1. Soal sesuai kurikulum SMP Indonesia dan tidak mengandung konten sensitif.
2. Bahasa Indonesia mudah dipahami siswa SMP.
3. Empat pilihan jawaban, tanpa duplikasi.
4. correctAnswer adalah indeks 0-3 dari options.
5. Sertakan explanation rinci dan 2 hints yang tidak langsung memberi jawaban.
6. JSON valid saja, tanpa markdown.

Output:
{"questions":[{"subject":"${safeParams.subject}","topic":"${safeParams.topic || '...'}","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":0,"explanation":"...","hints":["...","..."]}]}
`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    const parsed = extractJson(result.response.text()) as { questions?: Record<string, unknown>[] };
    const questions = (parsed.questions ?? []).slice(0, safeParams.count).map((question, index) => normalizeQuestion(question, safeParams, index));
    if (questions.length !== safeParams.count) throw new Error('Jumlah soal AI tidak sesuai.');
    setCache(key, questions, 60);
    return questions;
  } catch {
    const fallback = fallbackQuestions(safeParams);
    setCache(key, fallback, 10);
    return fallback;
  }
}

export async function chatWithTutor(params: { message: string; context: Message[]; studentLevel: number; currentSubject?: string }): Promise<string> {
  const ai = model();
  const message = sanitizeText(params.message, 1000);
  if (!ai) return fallbackTutor(message, params.studentLevel);
  const context = params.context.slice(-10).map((entry) => `${entry.role === 'user' ? 'Siswa' : 'Sage'}: ${entry.content}`).join('\n');
  const prompt = `
Kamu adalah "Sage", AI tutor untuk siswa SMP Indonesia.
Personality: ramah, sabar, encouraging, bahasa mudah dipahami, emoji secukupnya.
Tugas: jelaskan konsep pelajaran SMP, bantu langkah penyelesaian tanpa langsung membocorkan jawaban PR, buat contoh soal, motivasi.
Batas: jika topik di luar akademik, arahkan kembali ke belajar. Maksimal 150 kata.
Student Level: ${params.studentLevel}. Current Subject Context: ${params.currentSubject || 'General'}.
Riwayat chat terakhir:
${context}

Pesan siswa: ${message}
Jawab sebagai Sage dengan markdown sederhana bila perlu.`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    return sanitizeText(result.response.text(), 1600);
  } catch {
    return fallbackTutor(message, params.studentLevel);
  }
}

function fallbackTutor(message: string, level: number) {
  const lower = message.toLowerCase();
  if (lower.includes('quiz') || lower.includes('soal')) return `Siap! Untuk latihan level ${level}, pilih menu Quest Generator lalu tentukan mata pelajaran, kelas, dan tingkat kesulitan. Setelah menjawab, aku akan bantu jelaskan konsepnya. 🌟`;
  if (lower.includes('rencana') || lower.includes('study plan')) return 'Rencana belajar aman: 10 menit review konsep, 15 menit latihan soal, 5 menit catat kesalahan. Ulangi 5 hari dan fokus pada mata pelajaran dengan mastery terendah.';
  return 'Aku Sage. Coba pecah soalnya menjadi: diketahui, ditanya, rumus/konsep, lalu langkah penyelesaian. Kirim bagian yang membuatmu bingung, nanti aku bantu arahkan pelan-pelan. ✨';
}

export async function explainAnswer(params: { question: string; userAnswer: string; correctAnswer: string; subject: string }): Promise<string> {
  const ai = model();
  const fallback = `Jawaban yang benar adalah ${sanitizeText(params.correctAnswer, 200)}. Bandingkan dengan jawabanmu, lalu cari konsep kunci pada soal: ${sanitizeText(params.question, 160)}. Perbaiki dengan membaca kembali materi ${sanitizeText(params.subject, 80)} dan latihan satu soal serupa.`;
  if (!ai) return fallback;
  const prompt = `Jelaskan untuk siswa SMP Indonesia mengapa jawaban berikut salah/benar. Soal: ${sanitizeText(params.question, 600)}. Jawaban siswa: ${sanitizeText(params.userAnswer, 200)}. Jawaban benar: ${sanitizeText(params.correctAnswer, 200)}. Mata pelajaran: ${sanitizeText(params.subject, 80)}. Berikan konsep benar, langkah singkat, dan saran materi. Maksimal 140 kata.`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    return sanitizeText(result.response.text(), 1400);
  } catch {
    return fallback;
  }
}

export async function generateHint(params: { question: Question; previousHints: string[]; creativity: number }) {
  const ai = model();
  const staticHint = params.question.hints[Math.min(params.previousHints.length, params.question.hints.length - 1)] ?? 'Perhatikan kata kunci pada soal dan eliminasi dua opsi yang paling tidak sesuai.';
  if (!ai) return staticHint;
  const prompt = `Berikan satu hint untuk siswa SMP tanpa menyebut jawaban. Soal: ${params.question.question}. Opsi: ${params.question.options.join(' | ')}. Hint sebelumnya: ${params.previousHints.join(' | ') || 'belum ada'}. Kualitas hint disesuaikan kreativitas siswa ${params.creativity}/100. Maksimal 35 kata.`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    return sanitizeText(result.response.text(), 360);
  } catch {
    return staticHint;
  }
}

export async function generateStudyPlan(params: { weakSubjects: string[]; availableTime: number; examDate?: string }): Promise<StudyPlan> {
  const ai = model();
  const fallback: StudyPlan = {
    summary: `Fokus utama minggu ini adalah ${params.weakSubjects.join(', ') || 'review semua mata pelajaran'} dengan durasi ${params.availableTime} menit per hari.`,
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, index) => ({ day, focus: params.weakSubjects[index % Math.max(1, params.weakSubjects.length)] || 'Campuran', minutes: params.availableTime, tasks: ['Review konsep 10 menit', 'Latihan 5-10 soal', 'Catat 3 kesalahan dan perbaikannya'] })),
    priorityTopics: params.weakSubjects.flatMap((subject) => SUBJECT_TOPICS[subject as keyof typeof SUBJECT_TOPICS]?.slice(0, 2) ?? [subject]),
    dailyTarget: `Minimal ${Math.max(5, Math.floor(params.availableTime / 4))} soal benar per hari.`
  };
  if (!ai) return fallback;
  const prompt = `Buat study plan mingguan dalam JSON valid untuk siswa SMP. Weak subjects: ${params.weakSubjects.join(', ') || 'campuran'}. Waktu tersedia: ${params.availableTime} menit/hari. Tanggal ujian: ${params.examDate || 'belum ada'}. Output: {"summary":"...","days":[{"day":"Senin","focus":"...","minutes":30,"tasks":["...","..."]}],"priorityTopics":["..."],"dailyTarget":"..."}. Bahasa Indonesia, realistis, encouraging.`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    return extractJson(result.response.text()) as StudyPlan;
  } catch {
    return fallback;
  }
}

export async function generateInsights(params: { mastery: Record<string, number>; totalQuestions: number; streak: number }) {
  const ai = model();
  const weakest = Object.entries(params.mastery).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([subject]) => subject);
  const fallback = `Minggu ini kamu menjawab ${params.totalQuestions} soal dengan streak ${params.streak} hari. Fokus berikutnya: ${weakest.join(' dan ') || 'latihan campuran'}. Pertahankan rutinitas singkat setiap hari agar siap ujian.`;
  if (!ai) return fallback;
  const prompt = `Ringkas performa belajar siswa SMP berdasarkan mastery ${JSON.stringify(params.mastery)}, total questions ${params.totalQuestions}, streak ${params.streak}. Berikan rekomendasi personal, exam readiness singkat, dan fokus area. Maksimal 130 kata.`;
  try {
    const result = await withRateLimit(async () => ai.generateContent(prompt));
    return sanitizeText(result.response.text(), 1300);
  } catch {
    return fallback;
  }
}
