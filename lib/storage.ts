'use client';

import type { Guild, UserProfile } from './types';
import { createDemoProfile } from './game-engine';

const USERS_KEY = 'eduquest.users.v1';
const CURRENT_KEY = 'eduquest.currentUser.v1';
const GUILDS_KEY = 'eduquest.guilds.v1';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function getUsers() {
  if (typeof window === 'undefined') return [] as UserProfile[];
  const users = safeParse<UserProfile[]>(localStorage.getItem(USERS_KEY), []);
  if (!users.some((user) => user.username === 'demo_warrior')) {
    users.push(createDemoProfile());
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return users;
}

export function saveUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUsername() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentUsername(username: string | null) {
  if (username) localStorage.setItem(CURRENT_KEY, username);
  else localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser() {
  const username = getCurrentUsername();
  return getUsers().find((user) => user.username === username) ?? null;
}

export function saveCurrentUser(profile: UserProfile) {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === profile.id || user.username === profile.username);
  if (index >= 0) users[index] = profile;
  else users.push(profile);
  saveUsers(users);
  setCurrentUsername(profile.username);
}

export function getGuilds() {
  if (typeof window === 'undefined') return [] as Guild[];
  return safeParse<Guild[]>(localStorage.getItem(GUILDS_KEY), []);
}

export function saveGuilds(guilds: Guild[]) {
  localStorage.setItem(GUILDS_KEY, JSON.stringify(guilds));
}

export function exportProgress(profile: UserProfile) {
  const data = JSON.stringify({ exportedAt: new Date().toISOString(), profile }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `eduquest-${profile.username}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
