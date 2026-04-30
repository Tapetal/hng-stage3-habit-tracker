import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

/* MENTOR_TRACE_STAGE3_HABIT_A91 */
describe('calculateCurrentStreak', () => {
  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([], '2024-01-10')).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    expect(calculateCurrentStreak(['2024-01-09'], '2024-01-10')).toBe(0);
    expect(calculateCurrentStreak(['2024-01-08', '2024-01-09'], '2024-01-10')).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    expect(calculateCurrentStreak(['2024-01-10'], '2024-01-10')).toBe(1);
    expect(calculateCurrentStreak(['2024-01-09', '2024-01-10'], '2024-01-10')).toBe(2);
    expect(
      calculateCurrentStreak(['2024-01-08', '2024-01-09', '2024-01-10'], '2024-01-10')
    ).toBe(3);
  });

  it('ignores duplicate completion dates', () => {
    const completions = ['2024-01-10', '2024-01-10', '2024-01-09', '2024-01-09'];
    expect(calculateCurrentStreak(completions, '2024-01-10')).toBe(2);
  });

  it('breaks the streak when a calendar day is missing', () => {
    // today + two days ago (missing yesterday) => streak is 1, not 2
    expect(
      calculateCurrentStreak(['2024-01-08', '2024-01-10'], '2024-01-10')
    ).toBe(1);
    // only yesterday completed, not today => 0
    expect(calculateCurrentStreak(['2024-01-09'], '2024-01-10')).toBe(0);
  });
});
