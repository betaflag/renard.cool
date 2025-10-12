/**
 * Convert a string to a URL-friendly slug
 * Handles French characters, removes accents, converts to lowercase, replaces spaces with hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

/**
 * Reverse mapping: given a slug and a list of original strings, find the matching original
 */
export function findBySlug(slug: string, items: string[]): string | undefined {
  return items.find((item) => slugify(item) === slug);
}
