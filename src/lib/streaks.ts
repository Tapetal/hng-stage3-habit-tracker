/**
 * Calculates the current consecutive streak.
 * Rules:
 * - deduplicate completions
 * - sort by date
 * - if today is not completed, return 0
 * - if today is completed, count consecutive calendar days backwards
 */
export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  // Deduplicate
  const unique = Array.from(new Set(completions));

  // Sort ascending
  unique.sort();

  if (!unique.includes(todayStr)) return 0;

  let streak = 0;
  let current = new Date(todayStr + 'T00:00:00');

  while (true) {
    const dateStr = current.toISOString().slice(0, 10);
    if (!unique.includes(dateStr)) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}
