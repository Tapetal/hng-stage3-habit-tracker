import { User, Session } from '@/types/auth';
import { Habit } from '@/types/habit';

const KEYS = {
  USERS:   'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS:  'habit-tracker-habits',
} as const;

// ── Users ──────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// ── Session ────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SESSION);
}

// ── Habits ─────────────────────────────────────────────────────────────────

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.HABITS);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}
