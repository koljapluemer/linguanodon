import type { LanguageData } from './LanguageData';

/**
 * Format language display based on available space
 * In compact UIs: show emoji if available, otherwise code
 * In spacious UIs: show full name
 */
export function formatLanguageDisplay(language: LanguageData, compact: boolean = false): string {
  if (compact) {
    return language.emoji || language.code;
  }
  return language.name;
}