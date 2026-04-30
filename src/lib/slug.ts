/**
 * Converts a habit name into a URL-safe, stable slug.
 * - lowercase
 * - trim outer spaces
 * - collapse repeated internal spaces into a single hyphen
 * - remove non-alphanumeric characters except hyphens
 */
export function getHabitSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
