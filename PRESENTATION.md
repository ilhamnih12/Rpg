# 🎮 EduQuest RPG - Dokumentasi Presentasi

## 📊 Slide 1: Cover
- **Judul Project:** EduQuest RPG - Belajar Sambil Bertualang
- **Nama Pembuat:** Isi nama pembuat saat presentasi
- **Kelas & Sekolah:** Isi kelas dan sekolah
- **Logo/Screenshot Hero:** Gunakan halaman login dengan background hero, judul besar, dan card login demo
- **Talking point:** “EduQuest RPG mengubah latihan soal SMP menjadi petualangan RPG dengan AI tutor.”

## 📊 Slide 2: Latar Belakang Masalah
- Siswa SMP sering kurang motivasi belajar karena aktivitas terasa repetitif.
- Metode belajar konvensional kadang membosankan dan kurang feedback cepat.
- Konsep abstrak seperti aljabar, energi, grammar, dan peta sulit dipahami tanpa contoh.
- Siswa butuh pendekatan engaging, adaptif, dan bisa digunakan mandiri.
- **Visual:** Ikon siswa bosan → materi sulit → butuh solusi interaktif.

## 📊 Slide 3: Solusi - EduQuest RPG
- Game-based learning platform berbentuk RPG.
- Mekanik XP, level, battle, loot, achievement untuk motivasi.
- AI tutor Sage 24/7 untuk penjelasan, hint, study plan, dan quiz.
- Kompetitif lewat leaderboard, friend, guild, dan quiz battle.
- **Talking point:** “Siswa tidak hanya menjawab soal, tetapi merasa sedang menjalankan quest.”

## 📊 Slide 4: Target Pengguna
- Siswa SMP kelas 7-9.
- Usia 12-15 tahun.
- Mata pelajaran inti: Matematika, IPA, Bahasa Indonesia, Bahasa Inggris, IPS.
- Akses via browser mobile dan desktop.
- Guru dapat memakai aplikasi sebagai supplementary teaching tool.

## 📊 Slide 5: Fitur Utama (Visual)
- Screenshot/mockup: Character Creation.
- Screenshot/mockup: Quest System.
- Screenshot/mockup: AI Tutor Chat Sage.
- Screenshot/mockup: Battle System.
- Screenshot/mockup: Leaderboard dan Guild.
- Screenshot/mockup: Dashboard Analytics.
- **Tips demo:** tampilkan 6 panel fitur dari aplikasi.

## 📊 Slide 6: Teknologi yang Digunakan
- Frontend: Next.js 14 App Router.
- Language: TypeScript strict mode.
- Styling: Tailwind CSS + shadcn/ui-inspired components.
- AI: Google Gemini API model gemini-pro.
- Charts: Recharts.
- Animation: Framer Motion.
- Deployment: Vercel.
- Database MVP: localStorage, siap upgrade Vercel Postgres.

## 📊 Slide 7: AI Integration - Game Changer
- Generate soal unlimited berdasarkan topik, kelas, dan difficulty.
- Personalized learning lewat adaptive difficulty.
- 24/7 tutor assistance dengan Sage.
- Hint tanpa langsung memberi jawaban.
- Real-time feedback untuk jawaban salah.
- Study plan mingguan dari weak points.

## 📊 Slide 8: Cara Kerja AI (Diagram)
```text
Siswa
  ↓
Request Soal / Chat / Hint
  ↓
Next.js API Route
  ↓
Validasi Zod + Rate Limit Queue + Cache
  ↓
Gemini AI gemini-pro
  ↓
Structured JSON / Markdown Explanation
  ↓
Validasi & Normalisasi Response
  ↓
Display ke Game UI
  ↓
Jawaban Siswa → Reward / Explanation / Analytics
```

## 📊 Slide 9: Gamification Elements
- Level & XP System.
- Achievement Badges.
- Leaderboard Competition.
- Daily Login Rewards.
- Pet Companions.
- Study Streaks.
- Loot rarity: Common, Rare, Epic, Legendary.
- Crafting 3 Common menjadi 1 Rare.

## 📊 Slide 10: Dashboard & Analytics
- Circular progress per subject.
- XP chart last 7 days.
- Level progress bar.
- Study streak counter.
- Win/accuracy statistics.
- Radar chart untuk strong vs weak subjects.
- AI weekly performance summary.
- Calendar activity heatmap.

## 📊 Slide 11: Demo Flow (Screenshots)
1. Login demo: `demo_warrior / demo123`.
2. Create Character untuk akun baru.
3. Accept Daily Quest.
4. Answer Questions.
5. Request AI Hint.
6. Battle Monster.
7. Level Up dan loot drop.
8. Chat with AI Tutor Sage.
9. Check Dashboard dan Leaderboard.

## 📊 Slide 12: Manfaat untuk Siswa
✅ Belajar lebih menyenangkan.
✅ Motivasi intrinsik melalui rewards.
✅ Pemahaman konsep lebih baik dengan explanation.
✅ Kompetisi sehat.
✅ Self-paced learning.
✅ Instant feedback.
✅ Bisa dipakai di HP.

## 📊 Slide 13: Manfaat untuk Guru
✅ Monitor progress siswa.
✅ Identify weak areas.
✅ Supplementary teaching tool.
✅ Mengurangi beban membuat latihan awal.
✅ Engagement metrics.
✅ Bisa menjadi aktivitas kelas atau PR gamified.

## 📊 Slide 14: Keunggulan Kompetitif
- **vs Kahoot:** EduQuest lebih komprehensif, ada progress jangka panjang dan karakter.
- **vs Quizizz:** EduQuest punya RPG elements, AI tutor, inventory, battle, dan pets.
- **vs Ruangguru:** EduQuest gamified, free MVP, self-directed, dan bisa deploy sendiri.
- **Value utama:** belajar adaptif + game loop + AI feedback.

## 📊 Slide 15: Hasil Testing (Jika ada)
- Uji manual dilakukan pada:
  - Register/login.
  - Generate question fallback.
  - Quiz answer feedback.
  - Battle flow.
  - Inventory/crafting.
  - Dashboard charts.
  - Responsive layout.
- User testing yang disarankan:
  - 10 siswa SMP mencoba 15 menit.
  - Ukur motivasi sebelum/sesudah.
  - Catat fitur paling disukai.

## 📊 Slide 16: Roadmap Future
- Mobile app React Native.
- Teacher dashboard.
- Parent monitoring.
- AR battle features.
- Offline mode/PWA lengkap.
- Multiplayer co-op quests.
- Postgres database.
- Real-time PvP via Supabase Realtime.

## 📊 Slide 17: Challenges & Solutions
- **Challenge:** API quota limits.
- **Solution:** Caching, retry, queue, static fallback questions.

- **Challenge:** Responsive design.
- **Solution:** Mobile-first layout, touch target 44px, grid adaptif.

- **Challenge:** Performance.
- **Solution:** Code splitting Next.js, local data, cache AI, no external font fetch.

- **Challenge:** Data persistence MVP.
- **Solution:** localStorage + export/import progress.

## 📊 Slide 18: Live Demo
- Demo user: `demo_warrior`.
- Password: `demo123`.
- Showcase key features:
  - Dashboard analytics.
  - AI quest generation.
  - Battle demo.
  - Sage chat.
  - Inventory and achievements.
- Backup jika internet/API gagal: static fallback tetap bekerja.

## 📊 Slide 19: Cost Analysis
- Development: Free menggunakan open source tools.
- Hosting: Free Vercel hobby tier.
- AI API: Free tier Gemini sesuai limit Google AI Studio.
- Database MVP: Free localStorage.
- Domain: Optional sekitar $12/tahun.
- Total awal: $0 - $12/tahun.

## 📊 Slide 20: Call to Action
- Try the app: isi URL Vercel setelah deploy.
- GitHub repo: isi URL repository.
- Feedback form: isi URL Google Form.
- Contact info: isi email/WhatsApp pembuat.
- Ajakan: “Ayo ubah belajar menjadi petualangan.”

## 📊 Slide 21: Credits & Thank You
- Terima kasih kepada guru pembimbing.
- Terima kasih kepada siswa tester.
- Open source credits: Next.js, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, lucide-react.
- AI support: Google Gemini API.
- Q&A.

---

## Catatan Presenter

- Mulai dengan masalah nyata siswa SMP.
- Tunjukkan demo, jangan hanya teori.
- Tekankan bahwa Gemini punya fallback sehingga aplikasi tetap bisa dipresentasikan walau quota habis.
- Gunakan mode mobile browser untuk membuktikan responsive design.
- Siapkan screenshot Dashboard dan Battle untuk backup.
