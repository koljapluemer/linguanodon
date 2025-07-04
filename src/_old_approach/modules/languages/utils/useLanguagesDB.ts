/**
 * Canonical language list management for Linguanodon.
 *
 * This module provides a composable to access the canonical list of supported languages,
 * ensuring all backend access and caching logic is centralized and testable.
 * - Fetches from backend if cache is missing or stale
 * - Caches in Dexie for 24h
 * - Exposes a reactive list and manual refresh
 */
import { ref } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { Language } from '../types/Language'
import { fetchCanonicalLanguages } from '@/modules/db/db-remote/accessRemoteDB'

const CACHE_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in ms

/**
 * Loads the canonical language list from Dexie and updates the reactive value.
 */
async function loadFromDexie(languages: { value: Language[] }) {
  const langs = await db.canonicalLanguages.toArray()
  langs.sort((a, b) => a.tag.localeCompare(b.tag))
  languages.value = langs
}

/**
 * Provides a reactive canonical language list, using Dexie as a cache and the backend as SSoT.
 * Handles cache freshness, backend fetch, and manual refresh.
 */
export function useCanonicalLanguageList() {
  // Reactive list
  const languages = ref<Language[]>([])

  /**
   * Checks cache freshness and loads from Dexie or backend as needed.
   */
  async function init() {
    const meta = await db.canonicalLanguagesMeta.get('meta')
    const now = Date.now()
    if (meta && now - meta.lastFetched < CACHE_MAX_AGE) {
      await loadFromDexie(languages)
    } else {
      await fetchAndStore()
    }
  }

  /**
   * Fetches the canonical language list from the backend, sorts, stores, and updates reactive value.
   * Falls back to cached data or empty array on error.
   */
  async function fetchAndStore() {
    try {
      const langs = await fetchCanonicalLanguages()
      langs.sort((a, b) => a.tag.localeCompare(b.tag))
      languages.value = langs
      await db.canonicalLanguages.clear()
      await db.canonicalLanguages.bulkAdd(langs)
      await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: Date.now() })
    } catch {
      // On error, try to load from Dexie, else set empty
      const cached = await db.canonicalLanguages.toArray()
      if (cached.length > 0) {
        cached.sort((a, b) => a.tag.localeCompare(b.tag))
        languages.value = cached
      } else {
        languages.value = []
      }
      // Optionally: log error or trigger toast here
    }
  }

  /**
   * Manually refreshes the canonical language list from the backend.
   */
  async function refresh() {
    await fetchAndStore()
  }

  // Start initialization
  init()

  return {
    languages,
    refresh
  }
}
