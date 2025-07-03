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
    // TODO: Pre-populate Dexie with stale data
    // TODO: Call composable and ensure fetch is made
    expect(false).toBe(true) // RED
  })

  it('exposes the list reactively via composable', async () => {
    // TODO: Call composable, update Dexie, check reactivity
    expect(false).toBe(true) // RED
  })

  it('handles backend errors and falls back to cached data', async () => {
    // TODO: Pre-populate Dexie, mock fetch to fail, call composable
    expect(false).toBe(true) // RED
  })

  it('manual refresh updates the cache and composable output', async () => {
    // TODO: Call composable, trigger manual refresh, check Dexie and output
    expect(false).toBe(true) // RED
  })

  it('fetches real backend and returns a well-formed array (integration)', async () => {
    // TODO: Actually hit the backend URL and check for known languages
    expect(false).toBe(true) // RED
  })
}) 