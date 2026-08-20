'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Crown,
  Download,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Loader2,
  LogOut,
  MessageCircle,
  Mic,
  Moon,
  Package,
  Swords,
  Sun,
  Trophy,
  Upload,
  Users,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import type { Battle, CharacterClass, Difficulty, Grade, Guild, Message, Quest, Question, Subject, UserProfile } from '@/lib/types';
import {
  ACHIEVEMENTS,
  AVATARS,
  CLASS_INFO,
  ITEMS,
  MONSTERS,
  PETS,
  STATIC_QUESTIONS_BY_SUBJECT,
  SUBJECT_TOPICS,
  TITLES,
  dailyQuestsFor,
  storyQuests
} from '@/lib/static-data';
import {
  adaptiveDifficulty,
  awardRewards,
  calculateDamage,
  craftRare,
  createGuild,
  createProfile,
  dailyLoginReward,
  examReadiness,
  hashPassword,
  hpFor,
  recordAnswer,
  useItem as applyItemEffect,
  validateAnswer
} from '@/lib/game-engine';
import { exportProgress, getCurrentUser, getGuilds, getUsers, saveCurrentUser, saveGuilds, saveUsers, setCurrentUsername } from '@/lib/storage';
import { cn, formatNumber, sanitizeText, todayKey, uid } from '@/lib/utils';

const subjects = Object.keys(SUBJECT_TOPICS) as Subject[];
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'quests', label: 'Quest AI', icon: BookOpen },
  { id: 'battle', label: 'Battle', icon: Swords },
  { id: 'sage', label: 'Sage Tutor', icon: MessageCircle },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'mini', label: 'Mini-Game', icon: Gamepad2 },
  { id: 'achievements', label: 'Achievement', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Wand2 }
] as const;

type View = (typeof navItems)[number]['id'];
type Toast = { id: string; message: string; tone?: 'success' | 'error' | 'info' };
type QuizState = {
  quest?: Quest;
  questions: Question[];
  index: number;
  selected?: number;
  hints: string[];
  feedback?: string;
  startedAt: number;
  correct: number;
  completed: boolean;
  rewardPenalty: number;
};

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  characterName: string;
  classType: CharacterClass;
  avatar: string;
};

function apiPost<T>(url: string, body: unknown): Promise<T> {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (response) => {
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) throw new Error(data.error || 'Permintaan gagal diproses.');
    return data;
  });
}

export function EduQuestApp() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
    setGuilds(getGuilds());
    setProfile(getCurrentUser());
    setReady(true);
  }, []);

  const activeTheme = profile?.settings.theme;

  useEffect(() => {
    if (!activeTheme) return;
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
  }, [activeTheme]);

  const toast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((entry) => entry.id !== id)), 3600);
  }, []);

  const persistProfile = useCallback((next: UserProfile, message?: string, tone: Toast['tone'] = 'success') => {
    saveCurrentUser(next);
    setProfile(next);
    setUsers(getUsers());
    if (message) toast(message, tone);
  }, [toast]);

  const persistGuilds = useCallback((next: Guild[]) => {
    saveGuilds(next);
    setGuilds(next);
  }, []);

  const logout = () => {
    setCurrentUsername(null);
    setProfile(null);
    toast('Kamu keluar dari portal. Progress tetap tersimpan di perangkat.', 'info');
  };

  if (!ready) return <Splash />;
  if (!profile) return <AuthScreen onLogin={(next) => { setProfile(next); setUsers(getUsers()); }} toast={toast} />;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,.10),transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))]">
      <ToastStack toasts={toasts} />
      <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl">
        <div className="container flex min-h-16 items-center justify-between gap-3 py-3">
          <button className="flex items-center gap-3 text-left" onClick={() => setView('dashboard')} aria-label="Buka dashboard">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-glow">🎮</span>
            <span>
              <span className="block text-base font-black leading-tight sm:text-xl">EduQuest RPG</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Belajar sambil bertualang dengan Sage AI</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="hidden sm:inline-flex">Lv {profile.character.level}</Badge>
            <Badge variant="success" className="hidden sm:inline-flex">{formatNumber(profile.character.gold)} Gold</Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle dark mode"
              onClick={() => persistProfile({ ...profile, settings: { ...profile.settings, theme: profile.settings.theme === 'dark' ? 'light' : 'dark' } })}
            >
              {profile.settings.theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button variant="outline" size="icon" aria-label="Logout" onClick={logout}><LogOut className="size-5" /></Button>
          </div>
        </div>
      </header>

      <section className="container grid gap-4 py-4 lg:grid-cols-[280px_1fr] lg:py-6">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <ProfileCard profile={profile} />
          <nav className="mt-4 grid grid-cols-3 gap-2 rounded-3xl border bg-card p-2 shadow-card sm:grid-cols-5 lg:grid-cols-1" aria-label="Navigasi fitur EduQuest">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn('flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold transition sm:text-sm lg:justify-start', view === item.id ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted')}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {view === 'dashboard' && <Dashboard profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'quests' && <QuestCenter profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'battle' && <BattleArena profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'sage' && <SageTutor profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'inventory' && <Inventory profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'social' && <Social profile={profile} users={users} guilds={guilds} persistProfile={persistProfile} persistGuilds={persistGuilds} toast={toast} />}
              {view === 'mini' && <MiniGames profile={profile} persistProfile={persistProfile} toast={toast} />}
              {view === 'achievements' && <AchievementsView profile={profile} persistProfile={persistProfile} />}
              {view === 'settings' && <Settings profile={profile} persistProfile={persistProfile} toast={toast} onLogout={logout} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </section>
    </main>
  );
}

function Splash() {
  return (
    <main className="hero-gradient flex min-h-screen items-center justify-center p-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-20 animate-float items-center justify-center rounded-3xl bg-white/10 text-5xl shadow-glow">🎮</div>
        <h1 className="text-3xl font-black">Memuat EduQuest RPG...</h1>
        <p className="mt-2 text-white/75">Menyiapkan karakter, quest, monster, dan Sage AI.</p>
      </div>
    </main>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-20 z-50 grid max-w-sm gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className={cn('rounded-2xl border bg-card px-4 py-3 text-sm font-semibold shadow-card', toast.tone === 'error' && 'border-destructive/30 text-destructive', toast.tone === 'info' && 'border-secondary/30 text-secondary')}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AuthScreen({ onLogin, toast }: { onLogin: (profile: UserProfile) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [login, setLogin] = useState({ username: 'demo_warrior', password: 'demo123' });
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '', characterName: '', classType: 'warrior', avatar: AVATARS[0] });

  const doLogin = (username = login.username, password = login.password) => {
    const users = getUsers();
    const found = users.find((user) => user.username === username.trim().toLowerCase() && user.passwordHash === hashPassword(password));
    if (!found) {
      toast('Username atau password belum cocok.', 'error');
      return;
    }
    found.lastLogin = new Date().toISOString();
    saveCurrentUser(found);
    onLogin(found);
    toast(`Selamat datang, ${found.character.name}!`);
  };

  const doRegister = () => {
    if (form.username.trim().length < 3 || form.password.length < 5 || form.characterName.trim().length < 2) {
      toast('Isi username min 3 karakter, password min 5, dan nama karakter.', 'error');
      return;
    }
    const users = getUsers();
    if (users.some((user) => user.username === form.username.trim().toLowerCase())) {
      toast('Username sudah dipakai di perangkat ini.', 'error');
      return;
    }
    const profile = createProfile(form);
    users.push(profile);
    saveUsers(users);
    saveCurrentUser(profile);
    onLogin(profile);
    toast('Karakter baru berhasil dibuat!');
  };

  return (
    <main className="hero-gradient min-h-screen p-4 text-white sm:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_480px]">
        <div>
          <Badge className="border-white/20 bg-white/10 text-white">Next.js 14 • Gemini AI • LocalStorage MVP</Badge>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">EduQuest RPG</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">Platform game-based learning untuk siswa SMP. Buat karakter, lawan monster pelajaran, kumpulkan achievement, dan belajar bersama Sage AI tutor 24/7.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {['AI Quest Generator', 'Battle Edukatif', 'Dashboard Analytics'].map((item) => <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 font-bold backdrop-blur">{item}</div>)}
          </div>
        </div>
        <Card className="border-white/20 bg-white/95 text-foreground shadow-glow dark:bg-slate-950/95">
          <CardHeader>
            <CardTitle>{mode === 'login' ? 'Masuk Portal' : 'Buat Karakter RPG'}</CardTitle>
            <CardDescription>Demo siap pakai: demo_warrior / demo123</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'login' ? (
              <>
                <Field label="Username"><Input value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} /></Field>
                <Field label="Password"><Input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></Field>
                <Button className="w-full" onClick={() => doLogin()}>Masuk & Lanjutkan Quest</Button>
                <Button variant="outline" className="w-full" onClick={() => doLogin('demo_warrior', 'demo123')}>Gunakan Demo Level 18</Button>
                <button className="w-full text-sm font-semibold text-primary" onClick={() => setMode('register')}>Belum punya karakter? Buat sekarang</button>
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Username"><Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></Field>
                  <Field label="Email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
                </div>
                <Field label="Password"><Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
                <Field label="Nama Karakter"><Input value={form.characterName} onChange={(event) => setForm({ ...form, characterName: event.target.value })} /></Field>
                <Field label="Avatar">
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((avatar) => <button key={avatar} className={cn('rounded-2xl border p-3 text-3xl', form.avatar === avatar && 'border-primary bg-primary/10')} onClick={() => setForm({ ...form, avatar })}>{avatar}</button>)}
                  </div>
                </Field>
                <Field label="Kelas RPG">
                  <div className="grid gap-2">
                    {(Object.keys(CLASS_INFO) as CharacterClass[]).map((key) => (
                      <button key={key} className={cn('rounded-2xl border p-3 text-left transition hover:bg-muted', form.classType === key && 'border-primary bg-primary/10')} onClick={() => setForm({ ...form, classType: key })}>
                        <span className="font-bold">{CLASS_INFO[key].icon} {CLASS_INFO[key].label}</span>
                        <span className="block text-xs text-muted-foreground">{CLASS_INFO[key].bonus}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Button className="w-full" onClick={doRegister}>Mulai Petualangan</Button>
                <button className="w-full text-sm font-semibold text-primary" onClick={() => setMode('login')}>Sudah punya karakter? Login</button>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function ProfileCard({ profile }: { profile: UserProfile }) {
  const xpPercent = (profile.character.xp / profile.character.xpToNextLevel) * 100;
  return (
    <Card className="overflow-hidden">
      <div className="h-20" style={{ background: `linear-gradient(135deg, ${profile.character.themeColor}, #0ea5e9)` }} />
      <CardContent className="-mt-10 pb-5">
        <div className="flex items-end gap-3">
          <div className="flex size-20 items-center justify-center rounded-3xl border-4 border-card bg-muted text-5xl shadow">{profile.character.avatar}</div>
          <div className="min-w-0 pb-1">
            <h2 className="truncate text-xl font-black">{profile.character.name}</h2>
            <p className="text-sm text-muted-foreground">{CLASS_INFO[profile.character.class].icon} {CLASS_INFO[profile.character.class].label}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="gold"><Crown className="mr-1 size-3" /> {profile.character.title}</Badge>
          <Badge variant="success"><Flame className="mr-1 size-3" /> {profile.stats.currentStreak} streak</Badge>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold"><span>Level {profile.character.level}</span><span>{formatNumber(profile.character.xp)} / {formatNumber(profile.character.xpToNextLevel)} XP</span></div>
          <Progress value={xpPercent} indicatorClassName="bg-xp" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          {Object.entries(profile.character.stats).map(([key, value]) => <div key={key} className="rounded-2xl bg-muted p-2"><span className="block font-black">{value}</span><span className="uppercase text-muted-foreground">{key.slice(0, 3)}</span></div>)}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Dashboard({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const subjectData = subjects.map((subject) => ({ subject, mastery: profile.stats.subjectMastery[subject] ?? 0, answered: profile.stats.subjectAnswered[subject] ?? 0 }));
  const activity = Object.entries(profile.activity).slice(-7).map(([date, count], index) => ({ date: date.slice(5), xp: count * (30 + index * 3), count }));
  const accuracy = profile.stats.totalQuestionsAnswered ? Math.round((profile.stats.totalCorrectAnswers / profile.stats.totalQuestionsAnswered) * 100) : 0;
  const readiness = examReadiness(profile);

  const claimReward = () => {
    const result = dailyLoginReward(profile);
    persistProfile(result.profile, result.message, result.reward ? 'success' : 'info');
  };

  const getInsight = async () => {
    setLoadingInsight(true);
    try {
      const data = await apiPost<{ insight: string }>('/api/ai/insights', { mastery: profile.stats.subjectMastery, totalQuestions: profile.stats.totalQuestionsAnswered, streak: profile.stats.currentStreak });
      setInsight(data.insight);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Gagal mengambil insight.', 'error');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div>
      <SectionTitle icon={<BarChart3 className="size-5" />} title="Study Dashboard & Analytics" description="Pantau progress, mastery, streak, dan rekomendasi AI untuk belajar lebih efektif." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="⭐" label="Total XP" value={formatNumber(profile.stats.totalXpEarned)} detail={`Level ${profile.character.level}`} />
        <MetricCard icon="🎯" label="Akurasi" value={`${accuracy}%`} detail={`${profile.stats.totalCorrectAnswers}/${profile.stats.totalQuestionsAnswered} benar`} />
        <MetricCard icon="🔥" label="Study Streak" value={`${profile.stats.currentStreak} hari`} detail={`Rekor ${profile.stats.longestStreak} hari`} />
        <MetricCard icon="🧠" label="Exam Readiness" value={`${readiness}%`} detail="Prediksi dari mastery + konsistensi" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>XP 7 Hari Terakhir</CardTitle>
            <CardDescription>Aktivitas harian dari localStorage.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity.length ? activity : [{ date: todayKey().slice(5), xp: 0, count: 0 }]}>
                <defs><linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" /><YAxis /><Tooltip />
                <Area type="monotone" dataKey="xp" stroke="#22c55e" fill="url(#xpGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Subject Mastery</CardTitle><CardDescription>Radar chart kekuatan vs kelemahan.</CardDescription></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjectData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar dataKey="mastery" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Progress Per Mata Pelajaran</CardTitle><CardDescription>Circular progress + statistik jawaban.</CardDescription></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {subjectData.map((entry) => <SubjectProgress key={entry.subject} label={entry.subject} value={entry.mastery} answered={entry.answered} />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>AI Insights</CardTitle><CardDescription>Ringkasan mingguan dan rekomendasi personal dari Gemini/fallback.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={getInsight} disabled={loadingInsight}>{loadingInsight && <Loader2 className="size-4 animate-spin" />} Generate Insight</Button>
            <div className="min-h-36 rounded-2xl bg-muted p-4 text-sm leading-relaxed">{insight || 'Klik tombol untuk meminta Sage menganalisis performamu.'}</div>
            <Button variant="gold" className="w-full" onClick={claimReward}>Klaim Daily Login Reward</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Calendar Activity Heatmap</CardTitle><CardDescription>GitHub-style heatmap untuk kebiasaan belajar.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-14 gap-1 sm:grid-cols-31">
            {Array.from({ length: 31 }, (_, index) => {
              const day = new Date();
              day.setDate(day.getDate() - (30 - index));
              const key = todayKey(day);
              const count = profile.activity[key] ?? 0;
              return <div key={key} title={`${key}: ${count} aktivitas`} className={cn('aspect-square rounded-md border', count === 0 ? 'bg-muted' : count < 3 ? 'bg-emerald-200 dark:bg-emerald-900' : count < 6 ? 'bg-emerald-400' : 'bg-emerald-600')} />;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><span className="text-4xl">{icon}</span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-black">{value}</p><p className="text-xs text-muted-foreground">{detail}</p></div></CardContent></Card>;
}

function SubjectProgress({ label, value, answered }: { label: string; value: number; answered: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border p-4">
      <div className="grid size-16 place-items-center rounded-full text-sm font-black" style={{ background: `conic-gradient(#8b5cf6 ${value * 3.6}deg, hsl(var(--muted)) 0deg)` }}><span className="rounded-full bg-card px-2 py-1">{value}%</span></div>
      <div><p className="font-bold">{label}</p><p className="text-sm text-muted-foreground">{answered} soal dijawab</p></div>
    </div>
  );
}

function QuestCenter({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [subject, setSubject] = useState<Subject>('Matematika');
  const [topic, setTopic] = useState('Aljabar');
  const [difficulty, setDifficulty] = useState<Difficulty>(() => adaptiveDifficulty(profile, 'Matematika'));
  const [grade, setGrade] = useState<Grade>(8);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const daily = useMemo(() => dailyQuestsFor(todayKey()), []);
  const story = useMemo(() => storyQuests(), []);

  useEffect(() => setDifficulty(adaptiveDifficulty(profile, subject)), [subject, profile]);

  const startQuiz = (questions: Question[], quest?: Quest) => setQuiz({ quest, questions, index: 0, hints: [], startedAt: Date.now(), correct: 0, completed: false, rewardPenalty: 0 });

  const generate = async () => {
    setLoading(true);
    try {
      const data = await apiPost<{ questions: Question[]; source: string }>('/api/ai/generate-questions', { subject, difficulty, grade, count, topic });
      setGenerated(data.questions);
      toast(data.source === 'ai' ? 'Gemini berhasil membuat soal unik!' : 'Quota/API key tidak tersedia, memakai static fallback.', data.source === 'ai' ? 'success' : 'info');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Gagal generate soal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (quiz) return <QuizRunner quiz={quiz} setQuiz={setQuiz} profile={profile} persistProfile={persistProfile} toast={toast} />;

  return (
    <div>
      <SectionTitle icon={<BookOpen className="size-5" />} title="AI-Powered Quest System" description="Generate soal Gemini, hint AI, adaptive difficulty, dan quest harian campuran." />
      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Generate Soal Custom</CardTitle><CardDescription>Input topik, kelas, dan difficulty. Sistem otomatis fallback jika API key/quota habis.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mata Pelajaran"><Select value={subject} onChange={(e) => { const next = e.target.value as Subject; setSubject(next); setTopic(SUBJECT_TOPICS[next][0]); }}>{subjects.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="Topik"><Select value={topic} onChange={(e) => setTopic(e.target.value)}>{SUBJECT_TOPICS[subject].map((t) => <option key={t}>{t}</option>)}</Select></Field>
              <Field label="Kelas"><Select value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}><option value={7}>7 SMP</option><option value={8}>8 SMP</option><option value={9}>9 SMP</option></Select></Field>
              <Field label="Difficulty"><Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></Field>
              <Field label="Jumlah"><Input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} /></Field>
            </div>
            <Button className="w-full" onClick={generate} disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />} Generate dengan Sage Gemini</Button>
            {generated.length > 0 && <Button variant="secondary" className="w-full" onClick={() => startQuiz(generated)}>Mulai Quiz Generated ({generated.length} soal)</Button>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preview Soal Generated</CardTitle><CardDescription>Validasi struktur JSON: question, options, correctAnswer, explanation, hints.</CardDescription></CardHeader>
          <CardContent className="max-h-[480px] space-y-3 overflow-auto safe-scrollbar">
            {generated.length === 0 ? <EmptyState icon="🤖" title="Belum ada soal" text="Generate soal untuk melihat hasil Gemini atau fallback static." /> : generated.map((question, index) => <QuestionPreview key={question.id} question={question} index={index} />)}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Daily Quest Generator</CardTitle><CardDescription>10 quest baru setiap hari, mix semua mata pelajaran.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            {daily.map((quest) => <QuestCard key={quest.id} quest={quest} disabled={profile.completedQuests.includes(quest.id)} onStart={() => startQuiz(quest.questions, quest)} />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Story Mode</CardTitle><CardDescription>10 chapters, 5 battle per chapter, boss di menu Battle.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            {story.map((quest) => <QuestCard key={quest.id} quest={quest} disabled={profile.character.level < (quest.requirements?.minLevel ?? 1)} onStart={() => startQuiz(quest.questions, quest)} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuestionPreview({ question, index }: { question: Question; index: number }) {
  return <div className="rounded-2xl border p-4"><div className="mb-2 flex flex-wrap gap-2"><Badge>{index + 1}</Badge><Badge variant="outline">{question.subject}</Badge><Badge variant="secondary">{question.topic}</Badge><Badge variant="gold">{question.difficulty}</Badge></div><p className="font-semibold">{question.question}</p><ol className="mt-2 space-y-1 text-sm text-muted-foreground">{question.options.map((option) => <li key={option}>{option}</li>)}</ol></div>;
}

function QuestCard({ quest, onStart, disabled }: { quest: Quest; onStart: () => void; disabled?: boolean }) {
  return <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap gap-2"><Badge>{quest.type}</Badge><Badge variant="outline">{quest.subject}</Badge><Badge variant="gold">{quest.rewards.xp} XP</Badge></div><h3 className="mt-2 font-bold">{quest.title}</h3><p className="text-sm text-muted-foreground">{quest.description}</p></div><Button disabled={disabled} onClick={onStart}>{disabled ? 'Terkunci/Selesai' : 'Mulai'} <ChevronRight className="size-4" /></Button></div>;
}

function QuizRunner({ quiz, setQuiz, profile, persistProfile, toast }: { quiz: QuizState; setQuiz: (quiz: QuizState | null) => void; profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const question = quiz.questions[quiz.index];
  const [explaining, setExplaining] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  const answer = async (selected: number) => {
    if (quiz.feedback) return;
    const seconds = Math.round((Date.now() - quiz.startedAt) / 1000);
    const correct = validateAnswer(question, selected);
    let nextProfile = recordAnswer(profile, question, correct, seconds);
    let feedback = correct ? `Benar! ${question.explanation}` : 'Jawaban belum tepat. Mengambil penjelasan Sage...';
    if (correct) {
      const rewards = { xp: Math.max(5, question.rewards.xp - quiz.rewardPenalty), gold: Math.max(2, question.rewards.gold - quiz.rewardPenalty) };
      const result = awardRewards(nextProfile, rewards, question.subject);
      nextProfile = result.profile;
      feedback = `Benar! +${result.xp} XP dan +${result.gold} gold. ${question.explanation}`;
    } else {
      setExplaining(true);
      try {
        const data = await apiPost<{ explanation: string }>('/api/ai/explain-answer', { question: question.question, userAnswer: question.options[selected], correctAnswer: question.options[question.correctAnswer], subject: question.subject });
        feedback = data.explanation;
      } catch {
        feedback = `Jawaban benar: ${question.options[question.correctAnswer]}. ${question.explanation}`;
      } finally {
        setExplaining(false);
      }
    }
    persistProfile(nextProfile);
    setQuiz({ ...quiz, selected, feedback, correct: quiz.correct + (correct ? 1 : 0) });
  };

  const next = () => {
    if (quiz.index + 1 >= quiz.questions.length) {
      let nextProfile = profile;
      if (quiz.quest && !profile.completedQuests.includes(quiz.quest.id)) {
        const result = awardRewards({ ...profile, completedQuests: [...profile.completedQuests, quiz.quest.id], stats: { ...profile.stats, questsCompleted: profile.stats.questsCompleted + 1 } }, quiz.quest.rewards, quiz.quest.subject);
        nextProfile = result.profile;
        persistProfile(nextProfile, `Quest selesai! Bonus +${result.xp} XP dan +${result.gold} gold.`);
      }
      setQuiz({ ...quiz, completed: true });
      return;
    }
    setQuiz({ ...quiz, index: quiz.index + 1, selected: undefined, hints: [], feedback: undefined, startedAt: Date.now(), rewardPenalty: 0 });
  };

  const hint = async () => {
    if (quiz.hints.length >= 2) { toast('Maksimal 2 hint per soal.', 'info'); return; }
    setHintLoading(true);
    try {
      const data = await apiPost<{ hint: string }>('/api/ai/hint', { question, previousHints: quiz.hints, creativity: profile.character.stats.creativity });
      setQuiz({ ...quiz, hints: [...quiz.hints, data.hint], rewardPenalty: quiz.rewardPenalty + 5 });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Hint gagal.', 'error');
    } finally {
      setHintLoading(false);
    }
  };

  if (quiz.completed) return <Card><CardHeader><CardTitle>Quest Complete</CardTitle><CardDescription>Skor akhir quiz kamu.</CardDescription></CardHeader><CardContent className="text-center"><p className="text-6xl">🏆</p><h2 className="mt-3 text-3xl font-black">{quiz.correct}/{quiz.questions.length} benar</h2><p className="mt-2 text-muted-foreground">Cek Dashboard untuk update mastery dan streak.</p><Button className="mt-6" onClick={() => setQuiz(null)}>Kembali ke Quest Center</Button></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>{quiz.quest?.title ?? 'Custom AI Quiz'}</CardTitle><Badge>{quiz.index + 1}/{quiz.questions.length}</Badge></div>
        <Progress value={((quiz.index + 1) / quiz.questions.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl bg-muted p-5"><div className="mb-3 flex flex-wrap gap-2"><Badge variant="outline">{question.subject}</Badge><Badge variant="secondary">{question.topic}</Badge><Badge variant="gold">{question.difficulty}</Badge></div><h2 className="text-xl font-black leading-relaxed">{question.question}</h2></div>
        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const chosen = quiz.selected === index;
            const correct = question.correctAnswer === index;
            return <button key={option} onClick={() => answer(index)} disabled={Boolean(quiz.feedback)} className={cn('rounded-2xl border p-4 text-left font-semibold transition hover:bg-muted', quiz.feedback && correct && 'border-emerald-500 bg-emerald-500/10', quiz.feedback && chosen && !correct && 'border-destructive bg-destructive/10')}>{option}</button>;
          })}
        </div>
        {quiz.hints.length > 0 && <div className="space-y-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">{quiz.hints.map((entry, index) => <p key={entry}>💡 Hint {index + 1}: {entry}</p>)}</div>}
        {quiz.feedback && <div className="rounded-2xl border bg-card p-4 text-sm leading-relaxed"><ReactMarkdown>{quiz.feedback}</ReactMarkdown></div>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={hint} disabled={hintLoading || quiz.hints.length >= 2 || Boolean(quiz.feedback)}>{hintLoading && <Loader2 className="size-4 animate-spin" />} Minta Hint AI (-5 reward)</Button>
          {quiz.feedback && <Button onClick={next} disabled={explaining}>{quiz.index + 1 >= quiz.questions.length ? 'Selesaikan' : 'Soal Berikutnya'}</Button>}
          <Button variant="ghost" onClick={() => setQuiz(null)}>Keluar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BattleArena({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [chapter, setChapter] = useState(1);
  const [boss, setBoss] = useState(false);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const monsterPool = MONSTERS.slice((chapter - 1) * 3, (chapter - 1) * 3 + 3).length ? MONSTERS.slice((chapter - 1) * 3, (chapter - 1) * 3 + 3) : MONSTERS.slice(0, 3);

  const start = () => {
    const monster = { ...monsterPool[boss ? 0 : Math.floor(Math.random() * monsterPool.length)] };
    const questions = STATIC_QUESTIONS_BY_SUBJECT[monster.subject].slice(0, boss ? 10 : 5);
    const hp = hpFor(profile);
    setBattle({ id: uid('battle'), monster: { ...monster, hp: monster.maxHp + chapter * 35, maxHp: monster.maxHp + chapter * 35, level: chapter * 2 }, player: { hp, maxHp: hp, damage: 25 + profile.character.level * 2 }, questions, currentQuestionIndex: 0, status: 'active', combo: 0 });
    setLog([`Battle dimulai melawan ${monster.name}!`]);
  };

  const answer = (selected: number) => {
    if (!battle || battle.status !== 'active') return;
    const question = battle.questions[battle.currentQuestionIndex];
    const correct = validateAnswer(question, selected);
    let nextProfile = recordAnswer(profile, question, correct, 28);
    const nextBattle = structuredClone(battle) as Battle;
    if (correct) {
      nextBattle.combo += 1;
      const damage = calculateDamage(profile, question, nextBattle.combo);
      nextBattle.monster.hp = Math.max(0, nextBattle.monster.hp - damage);
      setLog((prev) => [`Combo ${nextBattle.combo}! Kamu memberi ${damage} damage.`, ...prev]);
      if (nextBattle.monster.hp <= 0) {
        nextBattle.status = 'won';
        const loot = [ITEMS[(chapter * 5 + selected) % ITEMS.length]];
        nextBattle.rewards = { xp: boss ? 420 + chapter * 50 : 150 + chapter * 25, gold: boss ? 220 + chapter * 30 : 80 + chapter * 15, loot };
        const reward = awardRewards({ ...nextProfile, stats: { ...nextProfile.stats, battlesWon: nextProfile.stats.battlesWon + 1 } }, nextBattle.rewards, question.subject);
        nextProfile = reward.profile;
        toast(`Victory! +${reward.xp} XP, +${reward.gold} gold, loot ${loot[0].name}.`);
      }
    } else {
      nextBattle.combo = 0;
      const damage = nextBattle.monster.damage + chapter * 2;
      nextBattle.player.hp = Math.max(0, nextBattle.player.hp - damage);
      setLog((prev) => [`Monster menyerang! Kamu menerima ${damage} damage.`, ...prev]);
      if (nextBattle.player.hp <= 0) nextBattle.status = 'lost';
    }
    if (nextBattle.status === 'active') nextBattle.currentQuestionIndex = (nextBattle.currentQuestionIndex + 1) % nextBattle.questions.length;
    persistProfile(nextProfile);
    setBattle(nextBattle);
  };

  const usePotion = () => {
    if (!battle) return;
    const potion = profile.inventory.find((item) => item.category === 'Potions' && (item.quantity ?? 1) > 0);
    if (!potion) { toast('Tidak ada potion di inventory.', 'error'); return; }
    const result = applyItemEffect(profile, potion.id);
    persistProfile(result.profile, result.message);
    setBattle({ ...battle, player: { ...battle.player, hp: Math.min(battle.player.maxHp, battle.player.hp + (potion.effect.heal ?? 40)) } });
  };

  if (!battle) return (
    <div>
      <SectionTitle icon={<Swords className="size-5" />} title="Battle System Edukatif" description="Real-time HP bar, combo damage, boss battle, loot drop, dan animasi CSS/Framer Motion." />
      <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <Card><CardHeader><CardTitle>Setup Battle</CardTitle><CardDescription>Story Mode 10 chapters • Boss 10 soal berturut-turut.</CardDescription></CardHeader><CardContent className="space-y-4"><Field label="Chapter"><Select value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>Chapter {i + 1}</option>)}</Select></Field><label className="flex items-center gap-3 rounded-2xl border p-4"><input type="checkbox" checked={boss} onChange={(e) => setBoss(e.target.checked)} /> Boss Battle (10 soal)</label><Button className="w-full" onClick={start}>Mulai Battle</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Monsterpedia (30+)</CardTitle><CardDescription>Monster unik bertema pelajaran.</CardDescription></CardHeader><CardContent className="grid max-h-[520px] gap-3 overflow-auto sm:grid-cols-2 safe-scrollbar">{MONSTERS.map((monster) => <div key={monster.id} className="rounded-2xl border p-4"><div className="text-3xl">{monster.image}</div><h3 className="font-bold">{monster.name}</h3><p className="text-xs text-muted-foreground">{monster.description}</p><Badge className="mt-2" variant="outline">Weak: {monster.weakness}</Badge></div>)}</CardContent></Card>
      </div>
    </div>
  );

  const question = battle.questions[battle.currentQuestionIndex];
  return (
    <div>
      <SectionTitle icon={<Swords className="size-5" />} title="Battle Arena" description="Jawab benar untuk menyerang; salah membuat monster menyerang balik." />
      <div className="grid gap-4 xl:grid-cols-[1fr_.75fr]">
        <Card>
          <CardContent className="space-y-5 p-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <motion.div animate={battle.combo > 0 ? { x: [0, 12, 0] } : {}} className="rounded-3xl border bg-muted p-4"><div className="text-6xl">{profile.character.avatar}</div><h3 className="font-black">{profile.character.name}</h3><Progress value={(battle.player.hp / battle.player.maxHp) * 100} indicatorClassName="bg-emerald-500" /><p className="mt-1 text-xs">HP {battle.player.hp}/{battle.player.maxHp}</p></motion.div>
              <motion.div animate={battle.status === 'active' ? { y: [0, -5, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }} className="rounded-3xl border bg-muted p-4"><div className="text-6xl">{battle.monster.image}</div><h3 className="font-black">{battle.monster.name}</h3><Progress value={(battle.monster.hp / battle.monster.maxHp) * 100} indicatorClassName="bg-destructive" /><p className="mt-1 text-xs">HP {battle.monster.hp}/{battle.monster.maxHp}</p></motion.div>
            </div>
            {battle.status === 'active' ? <><div className="rounded-3xl bg-card p-4 shadow"><Badge>{question.subject}</Badge><h2 className="mt-2 text-lg font-black">{question.question}</h2></div><div className="grid gap-3">{question.options.map((option, index) => <button key={option} className="rounded-2xl border p-4 text-left font-semibold hover:bg-muted" onClick={() => answer(index)}>{option}</button>)}</div><div className="flex flex-wrap gap-2"><Badge variant="gold">Combo x{battle.combo}</Badge><Button variant="outline" onClick={usePotion}>Gunakan Potion</Button></div></> : <div className="rounded-3xl border p-8 text-center"><p className="text-6xl">{battle.status === 'won' ? '🏆' : '💫'}</p><h2 className="mt-3 text-3xl font-black">{battle.status === 'won' ? 'Victory!' : 'Defeat'}</h2><p className="mt-2 text-muted-foreground">{battle.status === 'won' ? 'Loot masuk ke inventory.' : 'Coba lagi setelah review materi.'}</p><Button className="mt-5" onClick={() => setBattle(null)}>Kembali</Button></div>}
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Battle Log</CardTitle></CardHeader><CardContent className="space-y-2">{log.map((entry, index) => <p key={`${entry}-${index}`} className="rounded-2xl bg-muted p-3 text-sm">{entry}</p>)}</CardContent></Card>
      </div>
    </div>
  );
}

function SageTutor({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [profile.chat.length, loading]);

  const send = async (custom?: string) => {
    const content = sanitizeText(custom ?? message, 1000);
    if (!content) return;
    setMessage('');
    const userMsg: Message = { id: uid('msg'), role: 'user', content, createdAt: new Date().toISOString() };
    const pending = { ...profile, chat: [...profile.chat, userMsg] };
    persistProfile(pending);
    setLoading(true);
    try {
      const data = await apiPost<{ reply: string }>('/api/ai/chat', { message: content, context: pending.chat, studentLevel: profile.character.level });
      const assistant: Message = { id: uid('msg'), role: 'assistant', content: data.reply, createdAt: new Date().toISOString() };
      persistProfile({ ...pending, chat: [...pending.chat, assistant] });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Sage sedang tidak bisa menjawab.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const voice = () => {
    const Speech = (window as typeof window & { webkitSpeechRecognition?: new () => { lang: string; start: () => void; onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onerror: (() => void) | null } }).webkitSpeechRecognition;
    if (!Speech) { toast('Web Speech API belum tersedia di browser ini.', 'error'); return; }
    const recognition = new Speech();
    recognition.lang = 'id-ID';
    recognition.onresult = (event) => setMessage(event.results[0][0].transcript);
    recognition.onerror = () => toast('Voice input gagal. Coba ketik manual.', 'error');
    recognition.start();
  };

  const favorite = (msg: Message) => {
    const favorites = profile.favorites.some((entry) => entry.id === msg.id) ? profile.favorites.filter((entry) => entry.id !== msg.id) : [...profile.favorites, { ...msg, favorite: true }];
    persistProfile({ ...profile, favorites }, favorites.length ? 'Penjelasan favorit diperbarui.' : undefined);
  };

  const share = async (msg: Message) => {
    try {
      if (navigator.share) await navigator.share({ title: 'Penjelasan Sage EduQuest', text: msg.content });
      else await navigator.clipboard.writeText(msg.content);
      toast('Penjelasan siap dibagikan.');
    } catch { toast('Share dibatalkan.', 'info'); }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    const weakSubjects = Object.entries(profile.stats.subjectMastery).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([subject]) => subject);
    try {
      const data = await apiPost<{ plan: { summary: string; days: { day: string; focus: string; minutes: number; tasks: string[] }[]; priorityTopics: string[]; dailyTarget: string } }>('/api/ai/study-plan', { weakSubjects, availableTime: 35 });
      setStudyPlan(`${data.plan.summary}\n\nTarget: ${data.plan.dailyTarget}\n\n${data.plan.days.map((day) => `- ${day.day}: ${day.focus} (${day.minutes} menit) — ${day.tasks.join(', ')}`).join('\n')}`);
    } catch (error) { toast(error instanceof Error ? error.message : 'Gagal membuat study plan.', 'error'); }
    finally { setPlanLoading(false); }
  };

  return (
    <div>
      <SectionTitle icon={<MessageCircle className="size-5" />} title="AI Tutor Assistant - Sage" description="Chat friendly, context-aware, markdown, voice-to-text, favorite, share, study plan, quiz dan homework helper." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader><CardTitle>Sage Personal Tutor Chat</CardTitle><CardDescription>Tanya konsep, minta contoh, ringkasan, atau quiz custom.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[520px] overflow-auto rounded-3xl bg-muted p-4 safe-scrollbar">
              <div className="space-y-3">
                {profile.chat.map((msg) => <div key={msg.id} className={cn('max-w-[88%] rounded-3xl p-4 text-sm leading-relaxed shadow', msg.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card')}><ReactMarkdown>{msg.content}</ReactMarkdown>{msg.role === 'assistant' && <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => favorite(msg)}>⭐ Favorite</Button><Button size="sm" variant="outline" onClick={() => share(msg)}>Share</Button></div>}</div>)}
                {loading && <div className="rounded-3xl bg-card p-4 text-sm"><Loader2 className="mr-2 inline size-4 animate-spin" /> Sage sedang berpikir...</div>}
                <div ref={bottomRef} />
              </div>
            </div>
            <div className="flex gap-2"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contoh: Sage, jelaskan aljabar kelas 8 dengan contoh sederhana" onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void send(); }} /><Button size="icon" variant="outline" onClick={voice} aria-label="Voice input"><Mic className="size-5" /></Button><Button onClick={() => void send()} disabled={loading}>Kirim</Button></div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Quick Prompts</CardTitle></CardHeader><CardContent className="grid gap-2">{['Sage, buatkan saya 10 soal Aljabar kelas 8 tingkat medium!', 'Ringkas materi ekosistem dalam bullet points dan key takeaways.', 'Bantu saya memahami simple past tense tanpa langsung kasih jawaban PR.', 'Berikan motivasi belajar 1 menit sebelum boss battle.'].map((prompt) => <Button key={prompt} variant="outline" className="h-auto justify-start whitespace-normal p-3 text-left" onClick={() => void send(prompt)}>{prompt}</Button>)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Study Plan Generator</CardTitle></CardHeader><CardContent className="space-y-3"><Button className="w-full" onClick={generatePlan} disabled={planLoading}>{planLoading && <Loader2 className="size-4 animate-spin" />} Generate Mingguan</Button>{studyPlan && <pre className="whitespace-pre-wrap rounded-2xl bg-muted p-3 text-xs leading-relaxed">{studyPlan}</pre>}</CardContent></Card>
          <Card><CardHeader><CardTitle>Favorite Explanations</CardTitle></CardHeader><CardContent className="space-y-2">{profile.favorites.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada favorit.</p> : profile.favorites.slice(-4).map((fav) => <p key={fav.id} className="rounded-2xl bg-muted p-3 text-xs line-clamp-4">{fav.content}</p>)}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function Inventory({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [category, setCategory] = useState<'All' | 'Weapons' | 'Armor' | 'Potions' | 'Badges'>('All');
  const items = profile.inventory.filter((item) => category === 'All' || item.category === category);
  const doUse = (id: string) => {
    const result = applyItemEffect(profile, id);
    persistProfile(result.profile, result.message);
  };
  const doCraft = () => {
    const result = craftRare(profile);
    persistProfile(result.profile, result.message, result.message.includes('Butuh') ? 'error' : 'success');
  };
  const feedPet = (petId: string) => {
    if (profile.character.gold < 25) { toast('Gold belum cukup untuk memberi makan pet.', 'error'); return; }
    const next = { ...profile, character: { ...profile.character, gold: profile.character.gold - 25 }, pets: profile.pets.map((pet) => pet.id === petId ? { ...pet, happiness: Math.min(100, pet.happiness + 12) } : pet) };
    persistProfile(next, 'Pet senang! Happiness naik.');
  };
  return (
    <div>
      <SectionTitle icon={<Package className="size-5" />} title="Inventory, Loot, Pet & Customization" description="Weapons, Armor, Potions, Badges, craft 3 Common jadi Rare, dan companion unlock level." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>Inventory</CardTitle><CardDescription>{profile.inventory.length} item tersimpan.</CardDescription></div><Button variant="gold" onClick={doCraft}>Craft Rare</Button></div></CardHeader><CardContent><div className="mb-4 flex flex-wrap gap-2">{(['All', 'Weapons', 'Armor', 'Potions', 'Badges'] as const).map((cat) => <Button key={cat} size="sm" variant={category === cat ? 'default' : 'outline'} onClick={() => setCategory(cat)}>{cat}</Button>)}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-2"><span className="text-3xl">{item.icon}</span><Badge variant={item.rarity === 'Legendary' || item.rarity === 'Epic' ? 'gold' : 'outline'}>{item.rarity}</Badge></div><h3 className="mt-3 font-bold">{item.name} {item.quantity && item.quantity > 1 ? `x${item.quantity}` : ''}</h3><p className="mt-1 text-xs text-muted-foreground">{item.description}</p><Button size="sm" className="mt-3 w-full" variant={item.category === 'Potions' ? 'secondary' : 'outline'} onClick={() => doUse(item.id)}>{item.category === 'Potions' ? 'Gunakan' : 'Equip/Showcase'}</Button></div>)}</div></CardContent></Card>
        <div className="space-y-4"><Card><CardHeader><CardTitle>Character Customization</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Warna Tema"><Input type="color" value={profile.character.themeColor} onChange={(e) => persistProfile({ ...profile, character: { ...profile.character, themeColor: e.target.value } })} /></Field><Field label="Gelar"><Select value={profile.character.title} onChange={(e) => persistProfile({ ...profile, character: { ...profile.character, title: e.target.value } })}>{TITLES.map((title) => <option key={title}>{title}</option>)}</Select></Field></CardContent></Card><Card><CardHeader><CardTitle>Pet Companion</CardTitle><CardDescription>Unlock di level 10, 25, 50, 75, 100.</CardDescription></CardHeader><CardContent className="space-y-3">{PETS.map((pet) => { const owned = profile.pets.some((ownedPet) => ownedPet.id === pet.id); return <div key={pet.id} className={cn('rounded-2xl border p-3', !owned && 'opacity-55')}><div className="flex items-center justify-between"><span className="font-bold">{pet.icon} {pet.name}</span><Badge>{owned ? 'Owned' : `Lv ${pet.unlockLevel}`}</Badge></div><p className="text-xs text-muted-foreground">{pet.bonus}</p>{owned && <Button size="sm" variant="outline" className="mt-2" onClick={() => feedPet(pet.id)}>Feed 25 gold</Button>}</div>; })}</CardContent></Card></div>
      </div>
    </div>
  );
}

function Social({ profile, users, guilds, persistProfile, persistGuilds, toast }: { profile: UserProfile; users: UserProfile[]; guilds: Guild[]; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; persistGuilds: (g: Guild[]) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [friendName, setFriendName] = useState('');
  const [guildName, setGuildName] = useState('');
  const [guildChat, setGuildChat] = useState('');
  const leaderboard = [...users].sort((a, b) => b.character.level - a.character.level || b.stats.totalXpEarned - a.stats.totalXpEarned);
  const currentGuild = guilds.find((guild) => guild.id === profile.guildId);
  const addFriend = () => {
    const target = users.find((user) => user.username === friendName.trim().toLowerCase());
    if (!target || target.username === profile.username) { toast('User tidak ditemukan di localStorage perangkat ini.', 'error'); return; }
    if (profile.friends.includes(target.username)) { toast('Sudah berteman.', 'info'); return; }
    persistProfile({ ...profile, friends: [...profile.friends, target.username] }, `Kamu berteman dengan ${target.username}.`);
    setFriendName('');
  };
  const makeGuild = () => {
    if (guildName.trim().length < 3) { toast('Nama guild minimal 3 karakter.', 'error'); return; }
    const guild = createGuild(guildName.trim(), profile);
    persistGuilds([...guilds, guild]);
    persistProfile({ ...profile, guildId: guild.id, guildName: guild.name }, `Guild ${guild.name} dibuat.`);
  };
  const sendGuildChat = () => {
    if (!currentGuild || !guildChat.trim()) return;
    const nextGuilds = guilds.map((guild) => guild.id === currentGuild.id ? { ...guild, chat: [...guild.chat, { id: uid('gmsg'), username: profile.username, text: sanitizeText(guildChat, 240), createdAt: new Date().toISOString() }] } : guild);
    persistGuilds(nextGuilds);
    setGuildChat('');
  };
  const challenge = () => {
    const questions = STATIC_QUESTIONS_BY_SUBJECT.Matematika.slice(0, 10);
    const score = questions.reduce((sum, _, index) => sum + (index % 3 !== 0 ? 1 : 0), 0);
    const result = awardRewards(profile, { xp: score * 12, gold: score * 6 }, 'Matematika');
    persistProfile(result.profile, `PvP quiz selesai. Skor ${score}/10, bonus ${result.xp} XP.`);
  };
  return (
    <div>
      <SectionTitle icon={<Users className="size-5" />} title="Leaderboard & Social Features" description="Leaderboard lokal MVP, friend system, guild/squad chat, dan quiz battle PvP simulasi localStorage." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Global Leaderboard</CardTitle><CardDescription>Berdasarkan data pemain di localStorage.</CardDescription></CardHeader><CardContent className="space-y-3">{leaderboard.map((user, index) => <div key={user.id} className="flex items-center gap-3 rounded-2xl border p-3"><span className="font-black">#{index + 1}</span><span className="text-2xl">{user.character.avatar}</span><div className="min-w-0 flex-1"><p className="truncate font-bold">{user.username}</p><p className="text-xs text-muted-foreground">Lv {user.character.level} • {formatNumber(user.stats.totalXpEarned)} XP</p></div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Friends & PvP</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="username teman" /><Button onClick={addFriend}>Add</Button></div><div className="space-y-2">{profile.friends.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada teman. Tambah demo_warrior jika kamu login akun lain.</p> : profile.friends.map((friend) => <div key={friend} className="rounded-2xl bg-muted p-3 font-semibold">{friend}</div>)}</div><Button variant="secondary" className="w-full" onClick={challenge}>Challenge Friend to Quiz Battle</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Guild/Squad</CardTitle></CardHeader><CardContent className="space-y-4">{currentGuild ? <><div className="rounded-2xl border p-4"><h3 className="font-black">{currentGuild.name}</h3><p className="text-sm text-muted-foreground">{currentGuild.members.length}/10 member • {formatNumber(currentGuild.xp)} XP guild</p></div><div className="max-h-52 space-y-2 overflow-auto safe-scrollbar">{currentGuild.chat.map((chat) => <p key={chat.id} className="rounded-2xl bg-muted p-2 text-sm"><b>{chat.username}:</b> {chat.text}</p>)}</div><div className="flex gap-2"><Input value={guildChat} onChange={(e) => setGuildChat(e.target.value)} placeholder="chat guild" /><Button onClick={sendGuildChat}>Send</Button></div></> : <><Input value={guildName} onChange={(e) => setGuildName(e.target.value)} placeholder="Nama guild" /><Button className="w-full" onClick={makeGuild}>Create Guild</Button>{guilds.map((guild) => <Button key={guild.id} variant="outline" className="w-full justify-start" onClick={() => persistProfile({ ...profile, guildId: guild.id, guildName: guild.name }, `Join guild ${guild.name}.`)}>Join {guild.name}</Button>)}</>}</CardContent></Card>
      </div>
    </div>
  );
}

function MiniGames({ profile, persistProfile, toast }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void }) {
  const [a, setA] = useState(7);
  const [b, setB] = useState(8);
  const [answer, setAnswer] = useState('');
  const [cards, setCards] = useState(() => ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'].sort(() => Math.random() - 0.5));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const checkMath = () => {
    if (Number(answer) === a * b) {
      const result = awardRewards(profile, { xp: 25, gold: 10 }, 'Matematika');
      persistProfile(result.profile, 'Quick Math benar! Bonus XP.');
      setA(2 + Math.floor(Math.random() * 12)); setB(2 + Math.floor(Math.random() * 12)); setAnswer('');
    } else toast('Belum tepat. Coba hitung perkalian ulang.', 'error');
  };
  const flip = (index: number) => {
    if (open.includes(index) || matched.includes(index)) return;
    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      if (cards[nextOpen[0]] === cards[nextOpen[1]]) {
        const nextMatched = [...matched, ...nextOpen];
        setMatched(nextMatched); setOpen([]);
        if (nextMatched.length === cards.length) {
          const result = awardRewards(profile, { xp: 40, gold: 20 });
          persistProfile(result.profile, 'Memory Card selesai!');
        }
      } else window.setTimeout(() => setOpen([]), 650);
    }
  };
  const resetMemory = () => { setCards(['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'].sort(() => Math.random() - 0.5)); setOpen([]); setMatched([]); };
  return (
    <div>
      <SectionTitle icon={<Gamepad2 className="size-5" />} title="Brain Break Mini-Games" description="Math Puzzle Runner, Word Search, Memory Card, dan Quick Math Challenge." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Quick Math Challenge</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-4xl font-black">{a} × {b} = ?</p><Input value={answer} onChange={(e) => setAnswer(e.target.value)} inputMode="numeric" /><Button onClick={checkMath}>Cek Jawaban</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Memory Card Game</CardTitle></CardHeader><CardContent><div className="grid grid-cols-4 gap-2">{cards.map((card, index) => <button key={`${card}-${index}`} onClick={() => flip(index)} className="aspect-square rounded-2xl border bg-muted text-2xl font-black">{open.includes(index) || matched.includes(index) ? card : '❔'}</button>)}</div><Button variant="outline" className="mt-4 w-full" onClick={resetMemory}>Reset</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Word Search</CardTitle><CardDescription>Cari kata: ILMU, SAGE, QUEST.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-5 gap-1 text-center font-black">{'ILMUXSAGEQUESTABCD'.slice(0, 20).split('').map((letter, index) => <span key={index} className="rounded-lg border p-2">{letter}</span>)}</div><Button className="mt-4 w-full" onClick={() => { const result = awardRewards(profile, { xp: 20, gold: 8 }, 'Bahasa Indonesia'); persistProfile(result.profile, 'Word Search diselesaikan.'); }}>Tandai Selesai</Button></CardContent></Card>
      </div>
    </div>
  );
}

function AchievementsView({ profile, persistProfile }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void }) {
  const unlocked = ACHIEVEMENTS.filter((achievement) => profile.achievements.includes(achievement.id));
  return (
    <div>
      <SectionTitle icon={<Trophy className="size-5" />} title="Achievement System" description="50+ achievements kategori Study, Battle, Social, Special dengan title unlock dan reward." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3"><MetricCard icon="🏆" label="Unlocked" value={`${unlocked.length}/${ACHIEVEMENTS.length}`} detail="achievement terbuka" /><MetricCard icon="🎖️" label="Title" value={profile.character.title ?? '-'} detail="gelar aktif" /><MetricCard icon="💰" label="Gold" value={formatNumber(profile.character.gold)} detail="saldo hadiah" /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ACHIEVEMENTS.map((achievement) => { const isUnlocked = profile.achievements.includes(achievement.id); return <Card key={achievement.id} className={cn(!isUnlocked && 'opacity-60')}><CardContent className="p-4"><div className="flex items-start gap-3"><span className="text-3xl">{achievement.icon}</span><div><Badge variant={isUnlocked ? 'success' : 'outline'}>{isUnlocked ? 'Unlocked' : achievement.category}</Badge><h3 className="mt-2 font-black">{achievement.name}</h3><p className="text-sm text-muted-foreground">{achievement.description}</p><p className="mt-2 text-xs font-semibold">Reward: {achievement.reward.xp} XP • {achievement.reward.gold} gold • Title {achievement.titleUnlock}</p>{isUnlocked && achievement.titleUnlock && <Button size="sm" className="mt-3" variant="outline" onClick={() => persistProfile({ ...profile, character: { ...profile.character, title: achievement.titleUnlock } }, `Gelar aktif: ${achievement.titleUnlock}`)}>Pakai Gelar</Button>}</div></div></CardContent></Card>; })}</div>
    </div>
  );
}

function Settings({ profile, persistProfile, toast, onLogout }: { profile: UserProfile; persistProfile: (p: UserProfile, m?: string, t?: Toast['tone']) => void; toast: (message: string, tone?: Toast['tone']) => void; onLogout: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { profile?: UserProfile };
      if (!data.profile?.username) throw new Error('Format file tidak valid.');
      persistProfile(data.profile, 'Progress berhasil diimport.');
    } catch (error) { toast(error instanceof Error ? error.message : 'Import gagal.', 'error'); }
  };
  return (
    <div>
      <SectionTitle icon={<Wand2 className="size-5" />} title="Settings, Security & Data Portability" description="Tema, suara, notifikasi, export/import progress, dan reset sesi." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Preferences</CardTitle></CardHeader><CardContent className="space-y-4"><label className="flex items-center justify-between rounded-2xl border p-4"><span>Dark Mode</span><input type="checkbox" checked={profile.settings.theme === 'dark'} onChange={(e) => persistProfile({ ...profile, settings: { ...profile.settings, theme: e.target.checked ? 'dark' : 'light' } })} /></label><label className="flex items-center justify-between rounded-2xl border p-4"><span>Sound Enabled</span><input type="checkbox" checked={profile.settings.soundEnabled} onChange={(e) => persistProfile({ ...profile, settings: { ...profile.settings, soundEnabled: e.target.checked } })} /></label><label className="flex items-center justify-between rounded-2xl border p-4"><span>Notifications</span><input type="checkbox" checked={profile.settings.notificationsEnabled} onChange={(e) => persistProfile({ ...profile, settings: { ...profile.settings, notificationsEnabled: e.target.checked } })} /></label></CardContent></Card>
        <Card><CardHeader><CardTitle>Progress Backup</CardTitle><CardDescription>Data MVP tersimpan di localStorage perangkat ini.</CardDescription></CardHeader><CardContent className="space-y-3"><Button className="w-full" onClick={() => exportProgress(profile)}><Download className="size-4" /> Export Progress</Button><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => void importFile(e.target.files?.[0])} /><Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Import Progress</Button><Button variant="destructive" className="w-full" onClick={onLogout}>Logout</Button></CardContent></Card>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="grid place-items-center rounded-3xl border border-dashed p-10 text-center"><p className="text-5xl">{icon}</p><h3 className="mt-3 font-black">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>;
}
