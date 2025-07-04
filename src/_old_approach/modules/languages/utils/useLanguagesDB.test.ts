import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCanonicalLanguageList } from './useLanguagesDB'
import type { Language } from '../types/Language'
import { db } from '@/modules/db/db-local/accessLocalDB'
import * as remoteDB from '@/modules/db/db-remote/accessRemoteDB'

// Helper: mock backend data
const mockLanguages: Language[] = [
  { tag: 'en', name: 'English' },
  { tag: 'fr', name: 'French' },
  { tag: 'de', name: 'German' }
]

function sortByTag(arr: Language[]) {
  return [...arr].sort((a, b) => a.tag.localeCompare(b.tag))
}

async function waitForDbLanguages(expectedCount: number, timeout = 200) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const arr = await db.canonicalLanguages.toArray()
    if (arr.length === expectedCount) return arr
    await new Promise(r => setTimeout(r, 10))
  }
  return await db.canonicalLanguages.toArray()
}

async function waitForLanguages(refValue: { value: Language[] }, expectedCount: number, timeout = 200) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (refValue.value.length === expectedCount) return refValue.value
    await new Promise(r => setTimeout(r, 10))
  }
  return refValue.value
}

// TODO: Setup Dexie test DB and clear before each test

// TODO: Mock fetch for most tests, but allow one real backend fetch

describe('useCanonicalLanguageList', () => {
  beforeEach(async () => {
    await db.canonicalLanguages.clear()
    await db.canonicalLanguagesMeta.clear()
    vi.restoreAllMocks()
  })

  it('fetches and stores the language list in Dexie on first use', async () => {
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockResolvedValue(mockLanguages)
    const { languages } = useCanonicalLanguageList()
    // Wait for Dexie to be populated
    const dbLangs = await waitForDbLanguages(mockLanguages.length)
    expect(sortByTag(languages.value)).toEqual(sortByTag(mockLanguages))
    expect(sortByTag(dbLangs)).toEqual(sortByTag(mockLanguages))
  })

  it('uses cached list if it is fresh', async () => {
    // Pre-populate Dexie with fresh data
    const now = Date.now()
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(mockLanguages)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: now })
    // Mock fetchCanonicalLanguages to throw if called
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockImplementation(() => { throw new Error('Should not fetch') })
    const { languages } = useCanonicalLanguageList()
    // Wait for composable to read from Dexie and update reactive value
    const dbLangs = await waitForDbLanguages(mockLanguages.length)
    const reactiveLangs = await waitForLanguages(languages, mockLanguages.length)
    expect(sortByTag(reactiveLangs)).toEqual(sortByTag(mockLanguages))
    expect(sortByTag(dbLangs)).toEqual(sortByTag(mockLanguages))
  })

  it('fetches a new list if cache is stale or on manual refresh', async () => {
    // Pre-populate Dexie with stale data
    const oldLanguages: Language[] = [
      { tag: 'es', name: 'Spanish' },
      { tag: 'it', name: 'Italian' }
    ]
    const stale = Date.now() - (25 * 60 * 60 * 1000) // 25h ago
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(oldLanguages)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: stale })
    // Mock fetchCanonicalLanguages to return mockLanguages (new data)
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockResolvedValue(mockLanguages)
    const { languages, refresh } = useCanonicalLanguageList()
    // Wait for new data to be fetched and stored
    const dbLangs = await waitForDbLanguages(mockLanguages.length)
    const reactiveLangs = await waitForLanguages(languages, mockLanguages.length)
    expect(sortByTag(reactiveLangs)).toEqual(sortByTag(mockLanguages))
    expect(sortByTag(dbLangs)).toEqual(sortByTag(mockLanguages))
    // Now test manual refresh
    const newLanguages: Language[] = [
      { tag: 'ar', name: 'Arabic' },
      { tag: 'ru', name: 'Russian' }
    ]
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockResolvedValue(newLanguages)
    await refresh()
    const dbLangs2 = await waitForDbLanguages(newLanguages.length)
    const reactiveLangs2 = await waitForLanguages(languages, newLanguages.length)
    expect(sortByTag(reactiveLangs2)).toEqual(sortByTag(newLanguages))
    expect(sortByTag(dbLangs2)).toEqual(sortByTag(newLanguages))
  })

  it('exposes the list reactively via composable', async () => {
    // Pre-populate Dexie with initial data and a fresh timestamp
    const initialLanguages: Language[] = [
      { tag: 'es', name: 'Spanish' },
      { tag: 'it', name: 'Italian' }
    ]
    const now = Date.now()
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(initialLanguages)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: now })
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockResolvedValue(mockLanguages)
    const { languages, refresh } = useCanonicalLanguageList()
    // Wait for initial value
    const initialReactive = await waitForLanguages(languages, initialLanguages.length)
    expect(sortByTag(initialReactive)).toEqual(sortByTag(initialLanguages))
    // Now update Dexie via refresh (which will fetch mockLanguages)
    await refresh()
    const updatedReactive = await waitForLanguages(languages, mockLanguages.length)
    expect(sortByTag(updatedReactive)).toEqual(sortByTag(mockLanguages))
  })

  it('handles backend errors and falls back to cached data', async () => {
    // Pre-populate Dexie with valid cached data
    const cachedLanguages: Language[] = [
      { tag: 'es', name: 'Spanish' },
      { tag: 'it', name: 'Italian' }
    ]
    const now = Date.now()
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(cachedLanguages)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: now })
    // Mock fetchCanonicalLanguages to throw
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockRejectedValue(new Error('Backend error'))
    const { languages, refresh } = useCanonicalLanguageList()
    // Wait for initial value
    const initialReactive = await waitForLanguages(languages, cachedLanguages.length)
    expect(sortByTag(initialReactive)).toEqual(sortByTag(cachedLanguages))
    // Force a manual refresh (should not clear cached data)
    await refresh()
    const afterRefresh = await waitForLanguages(languages, cachedLanguages.length)
    expect(sortByTag(afterRefresh)).toEqual(sortByTag(cachedLanguages))
    // Now clear Dexie and test fallback to empty array
    await db.canonicalLanguages.clear()
    await db.canonicalLanguagesMeta.clear()
    const { languages: emptyLanguages, refresh: emptyRefresh } = useCanonicalLanguageList()
    // Wait for empty value
    await emptyRefresh()
    // Wait a bit for async
    await new Promise(r => setTimeout(r, 20))
    expect(emptyLanguages.value).toEqual([])
  })

  it('manual refresh updates the cache and composable output', async () => {
    // Pre-populate Dexie with initial data and a fresh timestamp
    const initialLanguages: Language[] = [
      { tag: 'es', name: 'Spanish' },
      { tag: 'it', name: 'Italian' }
    ]
    const now = Date.now()
    await db.canonicalLanguages.clear()
    await db.canonicalLanguages.bulkAdd(initialLanguages)
    await db.canonicalLanguagesMeta.put({ id: 'meta', lastFetched: now })
    const { languages, refresh } = useCanonicalLanguageList()
    // Wait for initial value
    const initialReactive = await waitForLanguages(languages, initialLanguages.length)
    expect(sortByTag(initialReactive)).toEqual(sortByTag(initialLanguages))
    // Mock fetchCanonicalLanguages to return new data
    const newLanguages: Language[] = [
      { tag: 'ar', name: 'Arabic' },
      { tag: 'ru', name: 'Russian' }
    ]
    vi.spyOn(remoteDB, 'fetchCanonicalLanguages').mockResolvedValue(newLanguages)
    await refresh()
    const updatedReactive = await waitForLanguages(languages, newLanguages.length)
    expect(sortByTag(updatedReactive)).toEqual(sortByTag(newLanguages))
    const dbLangs = await waitForDbLanguages(newLanguages.length)
    expect(sortByTag(dbLangs)).toEqual(sortByTag(newLanguages))
  })

  it('fetches real backend and returns a well-formed array (integration)', async () => {
    await db.canonicalLanguages.clear()
    await db.canonicalLanguagesMeta.clear()
    const { languages } = useCanonicalLanguageList()
    // Wait for the real backend fetch to complete
    for (let i = 0; i < 20; i++) {
      if (languages.value.length > 0) break
      await new Promise(r => setTimeout(r, 50))
    }
    expect(languages.value.length).toBeGreaterThan(0)
    for (const lang of languages.value) {
      expect(typeof lang.tag).toBe('string')
      expect(typeof lang.name).toBe('string')
    }
  })
}) 