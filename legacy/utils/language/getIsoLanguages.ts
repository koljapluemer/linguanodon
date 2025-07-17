import isoLangs from './isoLangs.json'
import type { Language } from '@/entities/Language'

interface IsoLanguage {
  code: string
  name: string
}

/**
 * Loads ISO languages from the JSON file and converts them to Language objects.
 * Returns a list of standard languages with custom=false.
 */
export function getIsoLanguages(): Language[] {
  return (isoLangs as IsoLanguage[]).map((lang) => ({
    code: lang.code,
    name: lang.name,
    custom: false
  }))
}