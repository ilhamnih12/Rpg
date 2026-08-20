export type CharacterClass = 'warrior' | 'mage' | 'ranger' | 'knight';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Grade = 7 | 8 | 9;
export type Subject = 'Matematika' | 'IPA' | 'Bahasa Indonesia' | 'Bahasa Inggris' | 'IPS';
export type ItemCategory = 'Weapons' | 'Armor' | 'Potions' | 'Badges';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  icon: string;
  description: string;
  effect: {
    stat?: 'intelligence' | 'creativity' | 'memory' | 'speed';
    amount?: number;
    heal?: number;
    xpMultiplier?: number;
    goldMultiplier?: number;
  };
  value: number;
  quantity?: number;
}

export interface Achievement {
  id: string;
  name: string;
  category: 'Study' | 'Battle' | 'Social' | 'Special';
  description: string;
  icon: string;
  titleUnlock?: string;
  requirement: number;
  metric: keyof UserProfile['stats'] | 'level' | 'friends' | 'guild';
  reward: { xp: number; gold: number };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  favorite?: boolean;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  grade: Grade;
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

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'story' | 'special';
  subject: string;
  difficulty: Difficulty;
  questions: Question[];
  rewards: { xp: number; gold: number; items?: Item[] };
  timeLimit?: number;
  requirements?: { minLevel?: number; completedQuests?: string[] };
  expiresAt?: string;
}

export interface Battle {
  id: string;
  monster: Monster;
  player: { hp: number; maxHp: number; damage: number };
  questions: Question[];
  currentQuestionIndex: number;
  status: 'active' | 'won' | 'lost';
  combo: number;
  rewards?: { xp: number; gold: number; loot: Item[] };
}

export interface Monster {
  id: string;
  name: string;
  image: string;
  subject: Subject;
  description: string;
  hp: number;
  maxHp: number;
  damage: number;
  level: number;
  weakness: string;
}

export interface Pet {
  id: string;
  name: string;
  icon: string;
  unlockLevel: number;
  bonus: string;
  happiness: number;
}

export interface StudyPlanDay {
  day: string;
  focus: string;
  minutes: number;
  tasks: string[];
}

export interface StudyPlan {
  summary: string;
  days: StudyPlanDay[];
  priorityTopics: string[];
  dailyTarget: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  character: {
    name: string;
    class: CharacterClass;
    level: number;
    xp: number;
    xpToNextLevel: number;
    gold: number;
    stats: {
      intelligence: number;
      creativity: number;
      memory: number;
      speed: number;
    };
    avatar: string;
    themeColor: string;
    title?: string;
  };
  inventory: Item[];
  achievements: string[];
  completedQuests: string[];
  stats: {
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    totalStudyTime: number;
    questsCompleted: number;
    battlesWon: number;
    currentStreak: number;
    longestStreak: number;
    totalXpEarned: number;
    totalGoldEarned: number;
    averageTimePerQuestion: number;
    subjectMastery: Record<string, number>;
    subjectAnswered: Record<string, number>;
    subjectCorrect: Record<string, number>;
  };
  friends: string[];
  guildId?: string;
  guildName?: string;
  chat: Message[];
  favorites: Message[];
  settings: {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  pets: Pet[];
  activePet?: string;
  dailyReward: { lastClaimed?: string; streak: number };
  activity: Record<string, number>;
  createdAt: string;
  lastLogin: string;
}

export interface Guild {
  id: string;
  name: string;
  members: string[];
  chat: { id: string; username: string; text: string; createdAt: string }[];
  xp: number;
}
