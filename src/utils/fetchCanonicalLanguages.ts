import type { Language } from "@/entities/Language"

/**
 * Used in the user settings page to allow the user to add target/native langs
 */
export async function fetchCanonicalLanguages(): Promise<Language[]> {
  const url = 'https://scintillating-empanada-730581.netlify.app/language_tags.json'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch canonical language list')
  return await res.json()
}