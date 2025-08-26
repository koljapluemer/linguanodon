import type { LanguageData } from './LanguageData';

export function renderLanguage(language: LanguageData): string {
  return language.emoji ? `${language.emoji} ${language.name}` : language.name;
}