import { db } from './db'
import type { Language } from '../types/Language'

const DEFAULT_LANGUAGES: Omit<Language, 'position'>[] = [
  { name: 'Egyptian Arabic', abbreviation: '🇪🇬', requiredByApp: true, isTargetLanguage: true },
  { name: 'Modern Standard Arabic', abbreviation: 'ض', requiredByApp: true, isTargetLanguage: true },
  { name: 'Other Arabic Dialect', abbreviation: '؟', requiredByApp: true, isTargetLanguage: true },
  { name: 'English', abbreviation: '🇬🇧', requiredByApp: true, isTargetLanguage: false },
]

export async function ensureDefaultLanguages() {
  const all = await db.languages.toArray()
  for (const def of DEFAULT_LANGUAGES) {
    if (!all.find(l => l.name === def.name)) {
      // Find max position in the relevant column
      const maxPos = Math.max(-1, ...all.filter(l => l.isTargetLanguage === def.isTargetLanguage).map(l => l.position))
      await db.languages.add({ ...def, position: maxPos + 1 })
    }
  }
}

export async function getLanguages() {
  return await db.languages.orderBy('position').toArray()
}

export async function addLanguage(
  lang: { name: string; abbreviation: string },
  isTargetLanguage: boolean
) {
  const all = (await db.languages.toArray()).filter(l => l.isTargetLanguage === isTargetLanguage)
  const position = all.length > 0 ? Math.max(...all.map(l => l.position)) + 1 : 0
  await db.languages.add({ ...lang, requiredByApp: false, isTargetLanguage, position })
}

export async function updateLanguage(name: string, updates: Partial<Omit<Language, 'name'|'requiredByApp'>>) {
  const lang = await db.languages.get(name)
  if (!lang || lang.requiredByApp) return
  await db.languages.update(name, updates)
}

export async function deleteLanguage(name: string) {
  const lang = await db.languages.get(name)
  if (!lang || lang.requiredByApp) return
  await db.languages.delete(name)
  await renormalizePositions(lang.isTargetLanguage)
}

export async function moveLanguage(name: string, direction: 'up'|'down') {
  const lang = await db.languages.get(name)
  if (!lang) return
  const all = (await db.languages.toArray()).filter(l => l.isTargetLanguage === lang.isTargetLanguage).sort((a, b) => a.position - b.position)
  const idx = all.findIndex(l => l.name === name)
  if (idx === -1) return
  let swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= all.length) return
  const swapLang = all[swapIdx]
  await db.languages.update(lang.name, { position: swapLang.position })
  await db.languages.update(swapLang.name, { position: lang.position })
}

async function renormalizePositions(isTargetLanguage: boolean) {
  const all = (await db.languages.toArray()).filter(l => l.isTargetLanguage === isTargetLanguage).sort((a, b) => a.position - b.position)
  for (let i = 0; i < all.length; i++) {
    if (all[i].position !== i) {
      await db.languages.update(all[i].name, { position: i })
    }
  }
}
