import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(Math.round(value));
}

export function sanitizeText(value: string, max = 900) {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}
