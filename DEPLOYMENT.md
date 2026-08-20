# 🚀 Deployment Guide - Vercel

Panduan deploy EduQuest RPG ke Vercel tanpa konfigurasi tambahan yang rumit.

---

## Prerequisites

- GitHub account.
- Vercel account free tier.
- Google Gemini API key.
- Node.js 18+ atau 20+ untuk local development.
- Repository sudah berisi source code EduQuest RPG.

---

## Step-by-Step Deployment

### 1. Push to GitHub

Jika project belum di-push:

```bash
git init
git add .
git commit -m "Initial EduQuest RPG"
git remote add origin [your-repo-url]
git push -u origin main
```

Jika sudah berada di repo Arena/GitHub, cukup push branch aktif.

---

### 2. Import ke Vercel

1. Buka https://vercel.com.
2. Login dengan GitHub.
3. Klik **Add New Project**.
4. Pilih repository EduQuest RPG.
5. Klik **Import**.

**Screenshot description:** halaman import Vercel menampilkan daftar repo GitHub dan tombol Import di sebelah nama repo.

---

### 3. Framework Settings

Vercel otomatis mendeteksi Next.js.

Pastikan setting berikut:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` |
| Node Version | 20.x recommended |

Tidak perlu mengubah `next.config.js`.

---

### 4. Environment Variables

Di Vercel project:

1. Buka **Settings**.
2. Pilih **Environment Variables**.
3. Tambahkan:

```bash
GEMINI_API_KEY=your_google_ai_studio_api_key_here
NEXT_PUBLIC_APP_NAME=EduQuest RPG
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

4. Pilih environment Production, Preview, dan Development jika dibutuhkan.
5. Klik Save.

**Screenshot description:** tabel environment variables dengan kolom Name, Value, Environment.

---

### 5. Deploy

1. Klik **Deploy**.
2. Tunggu proses install dan build.
3. Jika sukses, Vercel memberi URL production.
4. Buka URL tersebut.
5. Login dengan demo account.
6. Test Quest AI, Sage Chat, Battle, Dashboard.

---

## Post-Deployment Checklist

- [ ] Halaman login tampil.
- [ ] Demo account bisa login.
- [ ] Register akun baru berhasil.
- [ ] Dashboard chart tampil.
- [ ] Generate soal AI/fallback berhasil.
- [ ] Hint/explanation berjalan.
- [ ] Sage chat menjawab.
- [ ] Battle bisa dimulai.
- [ ] Inventory tampil.
- [ ] Export progress berjalan.
- [ ] Mobile responsive dicek di dev tools.

---

## Custom Domain Optional

1. Buka Vercel Project → Settings → Domains.
2. Masukkan domain, contoh `eduquest.example.com`.
3. Ikuti instruksi DNS:
   - A record untuk apex domain.
   - CNAME untuk subdomain.
4. Tunggu propagasi DNS.
5. Pastikan HTTPS aktif.

---

## Monitoring

Gunakan fitur Vercel:

- Deployment logs.
- Function logs untuk API AI.
- Analytics optional.
- Speed Insights optional.

Untuk error Gemini:

- Cek env `GEMINI_API_KEY`.
- Cek quota Google AI Studio.
- Cek logs API route.

---

## Troubleshooting

### Build gagal karena dependency

Solusi:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

Commit `package-lock.json` hasil terbaru.

### Environment variable tidak terbaca

Solusi:

- Pastikan variable dibuat untuk environment yang benar.
- Redeploy setelah menambah env.
- Gunakan `GEMINI_API_KEY`, bukan hanya public key.

### AI tidak menjawab di production

Solusi:

- Cek Vercel Function Logs.
- Pastikan API key valid.
- Cek quota/rate limit.
- Aplikasi akan fallback jika Gemini gagal.

### Data hilang setelah pindah browser

Ini normal untuk MVP localStorage.

Solusi:

- Gunakan **Export Progress**.
- Import file JSON di perangkat/browser baru.
- Untuk produksi multi-device, upgrade ke database.

### Warning npm audit Next.js

Karena requirement project memakai Next.js 14. Jika organisasi membutuhkan zero audit warning terbaru, evaluasi upgrade mayor ke Next.js 16 setelah menguji kompatibilitas. Untuk deployment sekolah/demo, gunakan versi Next.js 14 terbaru yang tersedia di package.json dan batasi penggunaan fitur berisiko.

---

## Upgrade ke Database Production

Rekomendasi Vercel Postgres schema:

```sql
create table users (
  id text primary key,
  username text unique not null,
  email text unique,
  created_at timestamptz default now()
);

create table profiles (
  user_id text references users(id),
  character jsonb not null,
  stats jsonb not null,
  settings jsonb not null,
  updated_at timestamptz default now()
);

create table inventory_items (
  id text primary key,
  user_id text references users(id),
  item_id text not null,
  quantity int default 1
);

create table achievements_unlocked (
  user_id text references users(id),
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);
```

Migrasi localStorage dapat dilakukan dari file export JSON.

---

## Production Hardening

- Tambahkan Auth.js/Clerk.
- Tambahkan Redis/Upstash rate limit per user/IP.
- Pindahkan guild chat ke database/realtime.
- Tambahkan observability Sentry.
- Tambahkan CSP headers.
- Tambahkan test e2e Playwright.
- Tambahkan backup database.

---

## Final Deploy Command Lokal

```bash
npm install
npm run lint
npm run type-check
npm run build
```

Jika semua sukses, project siap deploy.
