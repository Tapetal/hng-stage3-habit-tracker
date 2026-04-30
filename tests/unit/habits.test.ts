import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import { Habit } from '@/types/habit';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2024-01-10');
    expect(result.completions).toContain('2024-01-10');
  });

  it('removes a completion date when the date already exists', () => {
    const habit = { ...baseHabit, completions: ['2024-01-10'] };
    const result = toggleHabitCompletion(habit, '2024-01-10');
    expect(result.completions).not.toContain('2024-01-10');
  });

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: ['2024-01-09'] };
    const originalCompletions = [...habit.completions];
    toggleHabitCompletion(habit, '2024-01-10');
    expect(habit.completions).toEqual(originalCompletions);
  });

  it('does not return duplicate completion dates', () => {
    const habit = { ...baseHabit, completions: ['2024-01-10', '2024-01-10'] };
    // toggle off an already-duplicate date — result should have no dupes
    const removed = toggleHabitCompletion(habit, '2024-01-10');
    expect(removed.completions.filter(d => d === '2024-01-10').length).toBe(0);

    // toggle on a fresh date into a habit that had no dupes
    const clean = { ...baseHabit, completions: ['2024-01-09'] };
    const added = toggleHabitCompletion(clean, '2024-01-10');
    const unique = new Set(added.completions);
    expect(unique.size).toBe(added.completions.length);
  });
});
