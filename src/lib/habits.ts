import { Habit } from '@/types/habit';

/**
 * Toggles a completion date on a habit (immutably).
 * - adds date if not present
 * - removes date if already present
 * - no duplicates
 * - does not mutate original
 */
export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const existing = new Set(habit.completions);

  if (existing.has(date)) {
    existing.delete(date);
  } else {
    existing.add(date);
  }

  return {
    ...habit,
    completions: Array.from(existing),
  };
}
