# 🤖 Google Gemini API Setup Guide

Panduan ini menjelaskan cara menghubungkan EduQuest RPG dengan Google Gemini API untuk generate soal, chat Sage, hint, explanation, study plan, dan AI insights.

---

## 1. Create Google AI Studio Account

1. Buka: https://makersuite.google.com/app/apikey
2. Login dengan Google account.
3. Pastikan akun memiliki akses Google AI Studio.
4. Free tier tersedia untuk eksperimen dan demo sekolah.

**Screenshot description:** halaman Google AI Studio menampilkan tombol untuk membuat API key dan daftar project/key yang sudah dibuat.

---

## 2. Generate API Key

1. Klik **Create API key**.
2. Pilih project Google Cloud yang tersedia atau buat project baru.
3. Copy API key yang muncul.
4. Simpan key di tempat aman.
5. Jangan commit API key ke GitHub.

**Screenshot description:** modal berisi API key dengan tombol copy.

---

## 3. Setup di Project

Buat file `.env.local` di root project:

```bash
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EduQuest RPG
```

Untuk demo cepat, aplikasi juga membaca:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Namun praktik terbaik adalah memakai `GEMINI_API_KEY` server-side agar key tidak terekspos ke browser.

---

## 4. Install Dependencies

```bash
npm install
```

Package utama:

```json
"@google/generative-ai": "^0.21.0"
```

---

## 5. Test API dari Aplikasi

Jalankan server:

```bash
npm run dev
```

Buka aplikasi dan gunakan:

1. Login demo.
2. Masuk menu **Quest AI**.
3. Pilih Matematika → Aljabar → kelas 8 → medium.
4. Klik **Generate dengan Sage Gemini**.
5. Jika sukses, preview soal muncul dengan source AI.
6. Jika gagal, sistem memakai static fallback.

---

## 6. Test API via curl

```bash
curl -X POST http://localhost:3000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"subject":"Matematika","difficulty":"medium","grade":8,"count":5,"topic":"Aljabar"}'
```

Response sukses:

```json
{
  "questions": [
    {
      "id": "aiq_...",
      "subject": "Matematika",
      "topic": "Aljabar",
      "difficulty": "medium",
      "grade": 8,
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": 0,
      "explanation": "...",
      "hints": ["...", "..."],
      "generatedBy": "ai"
    }
  ],
  "generated_at": "timestamp",
  "source": "ai"
}
```

---

## 7. Rate Limits & Best Practices

EduQuest menerapkan beberapa perlindungan:

- Max 60 requests per minute.
- Queue system agar request tidak menumpuk liar.
- Exponential backoff retry.
- In-memory cache untuk request sejenis.
- Static fallback jika quota habis.
- User feedback via toast.

Best practices:

1. Jangan generate soal terlalu banyak sekaligus.
2. Gunakan count 5 untuk latihan biasa.
3. Gunakan cache untuk topik yang sering dipakai.
4. Simpan API key di environment variables.
5. Pantau quota di Google AI Studio.
6. Gunakan fallback untuk demo offline/terbatas.

---

## 8. Prompt Engineering Tips

Prompt yang baik harus spesifik:

```text
Kamu adalah AI pembuat soal untuk siswa SMP Indonesia.
Generate 5 soal pilihan ganda untuk Matematika, topik Aljabar, kelas 8, difficulty medium.
Output JSON valid saja tanpa markdown.
Setiap soal memiliki 4 opsi, correctAnswer index 0-3, explanation, dan 2 hints.
```

Tips:

- Sebutkan peran AI.
- Sebutkan target siswa.
- Sebutkan kurikulum/level.
- Minta format JSON valid.
- Batasi output.
- Beri constraint keamanan.
- Validasi response sebelum dipakai.

---

## 9. File Integrasi

- `lib/gemini-service.ts`: semua logic Gemini.
- `app/api/ai/generate-questions/route.ts`: generate soal.
- `app/api/ai/chat/route.ts`: chat Sage.
- `app/api/ai/hint/route.ts`: hint soal.
- `app/api/ai/explain-answer/route.ts`: penjelasan jawaban.
- `app/api/ai/study-plan/route.ts`: rencana belajar.
- `app/api/ai/insights/route.ts`: insight dashboard.

---

## 10. Troubleshooting

### Error: API key missing

Solusi:

- Pastikan `.env.local` ada.
- Restart dev server.
- Pastikan nama variable `GEMINI_API_KEY`.

### Error: quota exceeded/rate limit

Solusi:

- Tunggu beberapa menit.
- Kurangi jumlah request.
- Gunakan fallback static.
- Aktifkan cache topik.

### Error: invalid JSON from Gemini

Solusi:

- Aplikasi akan fallback otomatis.
- Perbaiki prompt agar “JSON valid saja”.
- Pastikan count tidak terlalu besar.

### Error: model unavailable

Solusi:

- Cek akses Google AI Studio.
- Pastikan region/account mendukung Gemini.
- Cek nama model `gemini-pro`.

### Build di Vercel gagal karena env

Solusi:

- Tambahkan env di Vercel Dashboard → Project Settings → Environment Variables.
- Redeploy.

---

## 11. Security Reminder

- Jangan tampilkan API key di UI.
- Jangan commit `.env.local`.
- Gunakan server-side API routes.
- Validasi semua request.
- Untuk produksi, tambahkan auth dan per-user rate limit.
