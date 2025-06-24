import type { UnitOfMeaning } from '../types/UnitOfMeaning'
import type { Language } from '../types/Language'

export function filterEligibleTranslationUnits(
  allUnits: UnitOfMeaning[],
  currentUnit: UnitOfMeaning,
  allLanguages: Language[]
): UnitOfMeaning[] {
  if (!currentUnit.languageName) return []
  const currentLang = allLanguages.find(l => l.name === currentUnit.languageName)
  if (!currentLang) return []
  const isTarget = currentLang.isTargetLanguage
  const alreadyConnected = new Set([currentUnit.id, ...(currentUnit.translations || [])])
  return allUnits.filter(u => {
    if (!u.languageName || alreadyConnected.has(u.id)) return false
    const lang = allLanguages.find(l => l.name === u.languageName)
    return lang ? lang.isTargetLanguage !== isTarget : false
  })
}
