import type { Language } from '../types/Language'

export function getLanguageAbbreviation(languageName: string | null, languages: Language[]): string {
  if (!languageName) return '-'
  const lang = languages.find(l => l.name === languageName)
  return lang ? lang.abbreviation : '-'
}
