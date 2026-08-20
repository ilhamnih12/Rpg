import type { Achievement, Battle, CharacterClass, Difficulty, Guild, Item, Message, Question, Subject, UserProfile } from './types';
import { ACHIEVEMENTS, CLASS_INFO, ITEMS, PETS } from './static-data';
import { clamp, todayKey, uid } from './utils';

export const XP_BASE = 120;

export function xpToNextLevel(level: number) {
  return Math.round(XP_BASE * Math.pow(level, 1.28));
}

export function hashPassword(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash << 5) - hash + value.charCodeAt(i);
  return `local-${Math.abs(hash)}`;
}

export function createProfile(input: { username: string; email: string; password: string; characterName: string; classType: CharacterClass; avatar: string }): UserProfile {
  const createdAt = new Date().toISOString();
  return {
    id: uid('user'),
    username: input.username.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    character: {
      name: input.characterName.trim(),
      class: input.classType,
      level: 1,
      xp: 0,
      xpToNextLevel: xpToNextLevel(1),
      gold: 120,
      stats: { intelligence: 8, creativity: 8, memory: 8, speed: 8 },
      avatar: input.avatar,
      themeColor: '#8b5cf6',
      title: 'Pemula Berani'
    },
    inventory: [{ ...ITEMS[10], quantity: 3 }, { ...ITEMS[0], quantity: 1 }, { ...ITEMS[15], quantity: 1 }],
    achievements: [],
    completedQuests: [],
    stats: {
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      totalStudyTime: 0,
      questsCompleted: 0,
      battlesWon: 0,
      currentStreak: 1,
      longestStreak: 1,
      totalXpEarned: 0,
      totalGoldEarned: 0,
      averageTimePerQuestion: 0,
      subjectMastery: { Matematika: 0, IPA: 0, 'Bahasa Indonesia': 0, 'Bahasa Inggris': 0, IPS: 0 },
      subjectAnswered: {},
      subjectCorrect: {}
    },
    friends: [],
    chat: [
      {
        id: uid('msg'),
        role: 'assistant',
        content: 'Halo! Aku Sage. Tanya materi SMP apa saja, minta quiz, atau minta rencana belajar. Aku akan membimbing tanpa langsung membocorkan jawaban PR. 🌟',
        createdAt
      }
    ],
    favorites: [],
    settings: { theme: 'light', soundEnabled: true, notificationsEnabled: true },
    pets: [],
    dailyReward: { streak: 0 },
    activity: { [todayKey()]: 1 },
    createdAt,
    lastLogin: createdAt
  };
}

export function createDemoProfile() {
  const profile = createProfile({ username: 'demo_warrior', email: 'demo@eduquest.local', password: 'demo123', characterName: 'Arka Numeria', classType: 'warrior', avatar: '🧑‍🚀' });
  profile.character.level = 18;
  profile.character.xp = 680;
  profile.character.xpToNextLevel = xpToNextLevel(18);
  profile.character.gold = 2450;
  profile.character.stats = { intelligence: 31, creativity: 24, memory: 28, speed: 22 };
  profile.character.title = 'Dragon Slayer';
  profile.inventory = ITEMS.slice(0, 18).map((item, index) => ({ ...item, quantity: item.category === 'Potions' ? 2 + (index % 3) : 1 }));
  profile.achievements = ACHIEVEMENTS.slice(0, 18).map((a) => a.id);
  profile.completedQuests = Array.from({ length: 16 }, (_, i) => `story-${(i % 10) + 1}`);
  profile.stats = {
    totalQuestionsAnswered: 236,
    totalCorrectAnswers: 184,
    totalStudyTime: 960,
    questsCompleted: 34,
    battlesWon: 29,
    currentStreak: 9,
    longestStreak: 16,
    totalXpEarned: 7920,
    totalGoldEarned: 5360,
    averageTimePerQuestion: 32,
    subjectMastery: { Matematika: 82, IPA: 68, 'Bahasa Indonesia': 74, 'Bahasa Inggris': 61, IPS: 70 },
    subjectAnswered: { Matematika: 70, IPA: 48, 'Bahasa Indonesia': 46, 'Bahasa Inggris': 36, IPS: 36 },
    subjectCorrect: { Matematika: 61, IPA: 34, 'Bahasa Indonesia': 36, 'Bahasa Inggris': 24, IPS: 29 }
  };
  profile.pets = PETS.slice(0, 2);
  profile.activePet = profile.pets[0].id;
  const today = new Date();
  profile.activity = {};
  for (let i = 0; i < 31; i += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    profile.activity[todayKey(day)] = 1 + ((i * 7) % 8);
  }
  return profile;
}

export function awardRewards(profile: UserProfile, reward: { xp: number; gold: number; items?: Item[] }, subject?: string) {
  const classInfo = CLASS_INFO[profile.character.class];
  const isClassSubject = subject === classInfo.subject || (profile.character.class === 'ranger' && String(subject).includes('Bahasa'));
  const xpMultiplier = profile.character.class === 'ranger' && String(subject).includes('Bahasa') ? 1.15 : 1;
  const goldMultiplier = profile.character.class === 'knight' && subject === 'IPS' ? 1.2 : 1;
  let xp = Math.round(reward.xp * xpMultiplier * (1 + profile.character.stats.intelligence / 500));
  let gold = Math.round(reward.gold * goldMultiplier);
  if (isClassSubject && profile.character.class === 'warrior') xp = Math.round(xp * 1.05);
  const next = structuredClone(profile) as UserProfile;
  next.character.xp += xp;
  next.character.gold += gold;
  next.stats.totalXpEarned += xp;
  next.stats.totalGoldEarned += gold;
  next.activity[todayKey()] = (next.activity[todayKey()] ?? 0) + 1;
  if (reward.items?.length) {
    reward.items.forEach((item) => addItem(next, item));
  }
  while (next.character.xp >= next.character.xpToNextLevel && next.character.level < 100) {
    next.character.xp -= next.character.xpToNextLevel;
    next.character.level += 1;
    next.character.xpToNextLevel = xpToNextLevel(next.character.level);
    next.character.stats.intelligence += 2;
    next.character.stats.creativity += 1;
    next.character.stats.memory += 2;
    next.character.stats.speed += 1;
    const unlocked = PETS.filter((pet) => pet.unlockLevel <= next.character.level && !next.pets.some((owned) => owned.id === pet.id));
    next.pets.push(...unlocked);
  }
  return { profile: unlockAchievements(next), xp, gold };
}

export function recordAnswer(profile: UserProfile, question: Question, isCorrect: boolean, seconds = 30) {
  const next = structuredClone(profile) as UserProfile;
  const subject = question.subject;
  next.stats.totalQuestionsAnswered += 1;
  next.stats.totalCorrectAnswers += isCorrect ? 1 : 0;
  next.stats.subjectAnswered[subject] = (next.stats.subjectAnswered[subject] ?? 0) + 1;
  next.stats.subjectCorrect[subject] = (next.stats.subjectCorrect[subject] ?? 0) + (isCorrect ? 1 : 0);
  next.stats.subjectMastery[subject] = Math.round((next.stats.subjectCorrect[subject] / next.stats.subjectAnswered[subject]) * 100);
  next.stats.averageTimePerQuestion = Math.round(((next.stats.averageTimePerQuestion * (next.stats.totalQuestionsAnswered - 1)) + seconds) / next.stats.totalQuestionsAnswered);
  next.stats.totalStudyTime += Math.max(1, Math.ceil(seconds / 60));
  next.activity[todayKey()] = (next.activity[todayKey()] ?? 0) + 1;
  return unlockAchievements(next);
}

export function unlockAchievements(profile: UserProfile) {
  const next = structuredClone(profile) as UserProfile;
  ACHIEVEMENTS.forEach((achievement) => {
    if (next.achievements.includes(achievement.id)) return;
    const value = metricValue(next, achievement);
    if (value >= achievement.requirement) {
      next.achievements.push(achievement.id);
      next.character.gold += achievement.reward.gold;
      next.character.xp += achievement.reward.xp;
      if (!next.character.title && achievement.titleUnlock) next.character.title = achievement.titleUnlock;
    }
  });
  return next;
}

function metricValue(profile: UserProfile, achievement: Achievement) {
  if (achievement.metric === 'level') return profile.character.level;
  if (achievement.metric === 'friends') return profile.friends.length;
  if (achievement.metric === 'guild') return profile.guildId ? 1 : 0;
  const value = profile.stats[achievement.metric as keyof UserProfile['stats']];
  return typeof value === 'number' ? value : 0;
}

export function addItem(profile: UserProfile, item: Item) {
  const existing = profile.inventory.find((entry) => entry.id === item.id);
  if (existing) existing.quantity = (existing.quantity ?? 1) + (item.quantity ?? 1);
  else profile.inventory.push({ ...item, quantity: item.quantity ?? 1 });
}

export function useItem(profile: UserProfile, itemId: string) {
  const next = structuredClone(profile) as UserProfile;
  const item = next.inventory.find((entry) => entry.id === itemId);
  if (!item) return { profile: next, message: 'Item tidak ditemukan.' };
  if (item.category === 'Potions') {
    next.character.stats.creativity += item.effect.amount ?? 1;
    item.quantity = Math.max(0, (item.quantity ?? 1) - 1);
    next.inventory = next.inventory.filter((entry) => (entry.quantity ?? 1) > 0);
    return { profile: unlockAchievements(next), message: `${item.name} digunakan. Kreativitas naik sementara untuk hint lebih baik.` };
  }
  if (item.effect.stat && item.effect.amount) {
    next.character.stats[item.effect.stat] += item.effect.amount;
    return { profile: unlockAchievements(next), message: `${item.name} dipasang. ${item.effect.stat.toUpperCase()} +${item.effect.amount}.` };
  }
  return { profile: next, message: `${item.name} dipamerkan di showcase.` };
}

export function craftRare(profile: UserProfile) {
  const next = structuredClone(profile) as UserProfile;
  const commons = next.inventory.filter((item) => item.rarity === 'Common');
  if (commons.length < 3) return { profile: next, message: 'Butuh 3 item Common untuk craft 1 Rare.' };
  const used = commons.slice(0, 3);
  next.inventory = next.inventory.filter((item) => !used.some((u) => u.id === item.id));
  addItem(next, ITEMS.find((item) => item.rarity === 'Rare') ?? ITEMS[15]);
  return { profile: unlockAchievements(next), message: 'Craft berhasil! Kamu mendapat item Rare.' };
}

export function calculateDamage(profile: UserProfile, question: Question, combo: number) {
  const base = 22 + profile.character.level * 2 + profile.character.stats.intelligence;
  const classBonus = profile.character.class === 'warrior' && question.subject === 'Matematika' ? 1.15 : 1;
  const comboBonus = 1 + combo * 0.18;
  const speedBonus = 1 + profile.character.stats.speed / 600;
  return Math.round(base * classBonus * comboBonus * speedBonus);
}

export function createGuild(name: string, profile: UserProfile): Guild {
  return { id: uid('guild'), name, members: [profile.username], chat: [], xp: profile.stats.totalXpEarned };
}

export function dailyLoginReward(profile: UserProfile) {
  const today = todayKey();
  const next = structuredClone(profile) as UserProfile;
  if (next.dailyReward.lastClaimed === today) return { profile: next, message: 'Reward login hari ini sudah diklaim.', reward: '' };
  const streak = next.dailyReward.lastClaimed ? daysBetween(next.dailyReward.lastClaimed, today) === 1 ? next.dailyReward.streak + 1 : 1 : 1;
  next.dailyReward = { lastClaimed: today, streak };
  next.stats.currentStreak = streak;
  next.stats.longestStreak = Math.max(next.stats.longestStreak, streak);
  let reward = '50 gold';
  next.character.gold += 50;
  if (streak % 30 === 0) { addItem(next, ITEMS.find((item) => item.rarity === 'Legendary') ?? ITEMS[49]); reward = 'Legendary badge'; }
  else if (streak % 7 === 0) { addItem(next, ITEMS.find((item) => item.rarity === 'Epic' && item.category === 'Weapons') ?? ITEMS[30]); reward = 'Epic weapon'; }
  else if (streak % 3 === 0) { addItem(next, ITEMS[11]); reward = '1 potion'; }
  return { profile: unlockAchievements(next), message: `Login streak ${streak} hari. Reward: ${reward}.`, reward };
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function adaptiveDifficulty(profile: UserProfile, subject: string): Difficulty {
  const mastery = profile.stats.subjectMastery[subject] ?? 50;
  if (mastery >= 78) return 'hard';
  if (mastery >= 52) return 'medium';
  return 'easy';
}

export function buildTutorContext(messages: Message[]) {
  return messages.slice(-8).map((msg) => `${msg.role === 'user' ? 'Siswa' : 'Sage'}: ${msg.content}`).join('\n');
}

export function validateAnswer(question: Question, selectedIndex: number) {
  return selectedIndex === question.correctAnswer;
}

export function hpFor(profile: UserProfile) {
  const scienceBonus = profile.character.class === 'mage' ? 25 : 0;
  return 120 + profile.character.level * 12 + profile.character.stats.memory * 2 + scienceBonus;
}

export function examReadiness(profile: UserProfile) {
  const masteryAvg = Object.values(profile.stats.subjectMastery).reduce((a, b) => a + b, 0) / 5;
  const streakBonus = clamp(profile.stats.currentStreak * 1.5, 0, 15);
  const volumeBonus = clamp(profile.stats.totalQuestionsAnswered / 8, 0, 20);
  return Math.round(clamp(masteryAvg * 0.65 + streakBonus + volumeBonus, 0, 100));
}
