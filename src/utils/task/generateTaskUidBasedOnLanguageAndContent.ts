/**
 * Generates a URL-safe UID for a task based on its language and content.
 * Uses encodeURIComponent to ensure the content is safe for URLs, but keeps language as-is (ISO code).
 */
export function generateTaskUidBasedOnLanguageAndContent(language: string, content: string): string {
  // Only encode content, language is expected to be ISO code and safe
  return `${language}_${encodeURIComponent(content)}`;
}
