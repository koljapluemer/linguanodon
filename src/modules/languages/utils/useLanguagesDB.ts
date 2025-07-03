import { ref } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { Language } from '../types/Language'
import { fetchCanonicalLanguages } from '@/modules/db/db-remote/accessRemoteDB'

// Canonical language list composable
export function useCanonicalLanguageList() {
  // Reactive list
  const languages = ref<Language[]>([])

  // On first use, fetch from backend and store in Dexie
  async function fetchAndStore() {
    const langs = await fetchCanonicalLanguages()
    // Sort alphabetically by tag
    langs.sort((a, b) => a.tag.localeCompare(b.tag))
    languages.value = langs
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(langs)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: Date.now() })
  }

  fetchAndStore()

  // Manual refresh (to be implemented)
  async function refresh() {
    await fetchAndStore()
  }

  return {
    languages,
    refresh
  }
}
