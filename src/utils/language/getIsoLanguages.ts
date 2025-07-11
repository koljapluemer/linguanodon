import isoLangs from './isoLangs.json'
import type { Language } from '@/entities/Language'

/**
 * Loads ISO languages from the JSON file and converts them to Language objects.
 * Returns a list of standard languages with custom=false.
 */
export function getIsoLanguages(): Language[] {
  return Object.entries(isoLangs).map(([code, data]) => ({
    code,
    name: data.name,
    custom: false
  }))
}