# 📡 API Documentation

Dokumentasi endpoint internal EduQuest RPG. Semua endpoint berada di Next.js App Router dan mengembalikan JSON.

Base URL lokal:

```text
http://localhost:3000
```

Base URL production:

```text
https://your-vercel-domain.vercel.app
```

---

## Authentication

MVP tidak memakai server auth. User login/register disimpan di localStorage. API AI menerima request dari aplikasi dan memvalidasi body menggunakan Zod.

Untuk production, tambahkan:

- Auth.js/Clerk.
- Per-user rate limit.
- Database audit log.
- CSRF policy jika menambah mutation sensitif.

---

## Error Format

```json
{
  "error": "Pesan error yang mudah dipahami"
}
```

Status umum:

- `200`: sukses.
- `400`: request tidak valid.
- `500`: error server tak terduga.

---

## POST /api/ai/generate-questions

Generate soal pilihan ganda dengan Gemini. Jika Gemini tidak tersedia, endpoint mengembalikan static fallback questions.

### Request

```json
{
  "subject": "Matematika",
  "difficulty": "medium",
  "grade": 8,
  "count": 5,
  "topic": "Aljabar"
}
```

### Field

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| subject | string | yes | Mata pelajaran |
| difficulty | easy/medium/hard | yes | Tingkat kesulitan |
| grade | 7/8/9 | yes | Kelas SMP |
| count | number 1-10 | yes | Jumlah soal |
| topic | string | no | Topik spesifik |

### Response

```json
{
  "questions": [
    {
      "id": "aiq_...",
      "subject": "Matematika",
      "topic": "Aljabar",
      "difficulty": "medium",
      "grade": 8,
      "question": "Jika ...?",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": 0,
      "explanation": "Langkah penyelesaian ...",
      "hints": ["Hint 1", "Hint 2"],
      "rewards": { "xp": 40, "gold": 20 },
      "generatedBy": "ai",
      "createdAt": "2026-08-20T00:00:00.000Z",
      "type": "multiple_choice"
    }
  ],
  "generated_at": "2026-08-20T00:00:00.000Z",
  "source": "ai"
}
```

### Notes

- `source` dapat bernilai `ai` atau `static`.
- Response Gemini diparse sebagai JSON dan dinormalisasi.
- Cache aktif per kombinasi request.

---

## POST /api/ai/chat

Chat dengan Sage AI Tutor.

### Request

```json
{
  "message": "Sage, jelaskan aljabar kelas 8 dengan contoh sederhana.",
  "context": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Aku bingung aljabar.",
      "createdAt": "2026-08-20T00:00:00.000Z"
    }
  ],
  "studentLevel": 18,
  "currentSubject": "Matematika"
}
```

### Response

```json
{
  "reply": "Tentu! Aljabar adalah cara memakai huruf sebagai pengganti angka...",
  "generated_at": "2026-08-20T00:00:00.000Z"
}
```

### Features

- Context-aware menggunakan riwayat chat.
- Bahasa ramah siswa SMP.
- Maksimal sekitar 150 kata dari prompt.
- Markdown sederhana didukung di client.

---

## POST /api/ai/explain-answer

Menjelaskan jawaban salah/benar dan konsep yang perlu dipelajari.

### Request

```json
{
  "question": "Jika x = 2, nilai 3x + 4 adalah?",
  "userAnswer": "A. 8",
  "correctAnswer": "B. 10",
  "subject": "Matematika"
}
```

### Response

```json
{
  "explanation": "Jawaban yang benar adalah 10 karena 3 × 2 + 4 = 6 + 4..."
}
```

### Use Case

Dipanggil otomatis ketika siswa menjawab salah pada quiz.

---

## POST /api/ai/hint

Memberi satu hint tanpa membocorkan jawaban. Client membatasi maksimal 2 hint per soal.

### Request

```json
{
  "question": {
    "id": "math-1",
    "subject": "Matematika",
    "topic": "Aljabar",
    "difficulty": "medium",
    "grade": 8,
    "question": "Jika x = 2, nilai 3x + 4 adalah?",
    "options": ["A. 8", "B. 10", "C. 12", "D. 14"],
    "correctAnswer": 1,
    "explanation": "...",
    "hints": ["Substitusi x terlebih dahulu.", "Kerjakan perkalian sebelum penjumlahan."],
    "rewards": { "xp": 40, "gold": 20 },
    "generatedBy": "static",
    "createdAt": "timestamp"
  },
  "previousHints": [],
  "creativity": 24
}
```

### Response

```json
{
  "hint": "Masukkan nilai x ke bentuk 3x + 4, lalu ikuti urutan operasi."
}
```

---

## POST /api/ai/study-plan

Generate study plan mingguan berdasarkan weak subjects dan waktu belajar harian.

### Request

```json
{
  "weakSubjects": ["Bahasa Inggris", "IPA"],
  "availableTime": 35,
  "examDate": "2026-09-15"
}
```

### Response

```json
{
  "plan": {
    "summary": "Fokus minggu ini adalah memperkuat Bahasa Inggris dan IPA...",
    "days": [
      {
        "day": "Senin",
        "focus": "Bahasa Inggris - Tenses",
        "minutes": 35,
        "tasks": ["Review konsep", "Latihan 8 soal", "Catat kesalahan"]
      }
    ],
    "priorityTopics": ["Grammar", "Vocabulary", "Energi", "Ekosistem"],
    "dailyTarget": "Minimal 8 soal benar per hari."
  }
}
```

---

## GET /api/ai/daily-quests

Mengembalikan 10 quest harian berdasarkan tanggal.

### Request

```bash
curl http://localhost:3000/api/ai/daily-quests
```

### Response

```json
{
  "date": "2026-08-20",
  "quests": [
    {
      "id": "daily-2026-08-20-1",
      "title": "Quest Harian 1: Aljabar",
      "description": "Selesaikan 3 soal...",
      "type": "daily",
      "subject": "Matematika",
      "difficulty": "medium",
      "questions": [],
      "rewards": { "xp": 80, "gold": 40, "items": [] },
      "timeLimit": 300,
      "expiresAt": "timestamp"
    }
  ],
  "generated_at": "timestamp"
}
```

---

## POST /api/ai/insights

Generate insight performa mingguan untuk dashboard.

### Request

```json
{
  "mastery": {
    "Matematika": 82,
    "IPA": 68,
    "Bahasa Indonesia": 74,
    "Bahasa Inggris": 61,
    "IPS": 70
  },
  "totalQuestions": 236,
  "streak": 9
}
```

### Response

```json
{
  "insight": "Kamu konsisten dengan streak 9 hari. Fokus minggu ini adalah Bahasa Inggris dan IPA..."
}
```

---

## Data Types

### Question

```ts
interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  grade: 7 | 8 | 9;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hints: string[];
  rewards: { xp: number; gold: number };
  generatedBy: 'ai' | 'static';
  createdAt: string;
  type?: 'multiple_choice' | 'short_answer' | 'true_false';
}
```

### StudyPlan

```ts
interface StudyPlan {
  summary: string;
  days: {
    day: string;
    focus: string;
    minutes: number;
    tasks: string[];
  }[];
  priorityTopics: string[];
  dailyTarget: string;
}
```

---

## Rate Limiting Internal

`lib/gemini-service.ts` menerapkan:

- `MAX_PER_MINUTE = 60`.
- Queue promise berantai.
- Retry 3 kali.
- Delay exponential.
- Cache TTL 10-60 menit tergantung jenis data.

---

## Fallback Behavior

Jika terjadi:

- API key kosong.
- Rate limit/quota habis.
- Gemini response bukan JSON.
- Network error.

Maka endpoint tetap mengembalikan fallback statis agar demo tidak gagal total.
