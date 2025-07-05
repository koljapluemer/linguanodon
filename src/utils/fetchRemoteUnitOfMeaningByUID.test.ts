import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchRemoteUnitOfMeaningByUID } from './fetchRemoteUnitOfMeaningByUID'
import type { UnitOfMeaningData } from '@/entities/UnitOfMeaningData'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchRemoteUnitOfMeaningByUID', () => {
  // Real data structure from the API
  const mockUnitOfMeaningData: UnitOfMeaningData = {
    uid: "apc_%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4_sentence",
    language: "apc",
    content: "ما بعرفش",
    linguType: "sentence",
    context: "unknown",
    translations: ["en_I%20couldn%27t%20say_sentence"],
    userCreated: false
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return unit of meaning data successfully', async () => {
    const unitUid = "apc_%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4_sentence"
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockUnitOfMeaningData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteUnitOfMeaningByUID(unitUid)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/apc/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    expect(mockResponse.json).toHaveBeenCalledOnce()
    expect(result).toEqual(mockUnitOfMeaningData)
  })

  it('should extract language correctly from unit UID', async () => {
    const testCases = [
      { unitUid: 'en_hello_word', expectedLang: 'en' },
      { unitUid: 'es_hola_phrase', expectedLang: 'es' },
      { unitUid: 'apc_%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4_sentence', expectedLang: 'apc' },
      { unitUid: 'zh-CN_你好_word', expectedLang: 'zh-CN' }
    ]
    
    for (const { unitUid, expectedLang } of testCases) {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockUnitOfMeaningData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await fetchRemoteUnitOfMeaningByUID(unitUid)

      const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/${expectedLang}/${unitUid}.json`
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    }
  })

  it('should throw error when response is not ok', async () => {
    const unitUid = 'apc_nonexistent_unit'
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteUnitOfMeaningByUID(unitUid)).rejects.toThrow(`Failed to fetch unit ${unitUid} for apc`)
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/apc/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when fetch fails', async () => {
    const unitUid = 'apc_test_unit'
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValue(networkError)

    await expect(fetchRemoteUnitOfMeaningByUID(unitUid)).rejects.toThrow('Network error')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/apc/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when json parsing fails', async () => {
    const unitUid = 'apc_test_unit'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteUnitOfMeaningByUID(unitUid)).rejects.toThrow('Invalid JSON')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/apc/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle unit with URL-encoded content', async () => {
    const unitUid = "apc_%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4_sentence"
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockUnitOfMeaningData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteUnitOfMeaningByUID(unitUid)

    expect(result).toEqual(mockUnitOfMeaningData)
    expect(result.uid).toContain('%')
    expect(result.content).toBe('ما بعرفش')
    expect(result.translations?.[0]).toContain('%')
  })

  it('should handle unit with all optional fields', async () => {
    const unitUid = 'en_complete_unit'
    const completeUnitData: UnitOfMeaningData = {
      uid: unitUid,
      language: 'en',
      content: 'Hello world',
      linguType: 'sentence',
      pronunciation: 'həˈloʊ wɜrld',
      notes: 'Basic greeting phrase',
      translations: ['es_hola_mundo_sentence'],
      related: ['en_hi_word'],
      userCreated: true,
      author: 'test_user',
      context: 'greeting',
      license: 'CC-BY-SA',
      owner: 'Linguanodon',
      ownerLink: 'https://linguanodon.com',
      source: 'Common phrase',
      sourceLink: 'https://example.com'
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(completeUnitData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteUnitOfMeaningByUID(unitUid)

    expect(result).toEqual(completeUnitData)
    expect(result.pronunciation).toBe('həˈloʊ wɜrld')
    expect(result.notes).toBe('Basic greeting phrase')
    expect(result.author).toBe('test_user')
    expect(result.license).toBe('CC-BY-SA')
  })

  it('should handle unit with minimal required fields', async () => {
    const unitUid = 'en_minimal_unit'
    const minimalUnitData: UnitOfMeaningData = {
      uid: unitUid,
      language: 'en',
      content: 'Hello',
      linguType: 'word',
      context: 'greeting',
      userCreated: false
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(minimalUnitData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteUnitOfMeaningByUID(unitUid)

    expect(result).toEqual(minimalUnitData)
    expect(result.pronunciation).toBeUndefined()
    expect(result.notes).toBeUndefined()
    expect(result.translations).toBeUndefined()
    expect(result.related).toBeUndefined()
    expect(result.author).toBeUndefined()
  })

  it('should handle unit with empty arrays', async () => {
    const unitUid = 'en_empty_arrays_unit'
    const unitWithEmptyArrays: UnitOfMeaningData = {
      uid: unitUid,
      language: 'en',
      content: 'Test',
      linguType: 'word',
      context: 'test',
      translations: [],
      related: [],
      userCreated: false
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(unitWithEmptyArrays)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteUnitOfMeaningByUID(unitUid)

    expect(result).toEqual(unitWithEmptyArrays)
    expect(result.translations).toEqual([])
    expect(result.related).toEqual([])
  })

  it('should handle unit UID without underscore separator', async () => {
    const unitUid = 'en'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockUnitOfMeaningData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    await fetchRemoteUnitOfMeaningByUID(unitUid)

    // Should extract 'en' as language and use it in URL
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/en/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle special characters in unit UID', async () => {
    const unitUid = 'zh-CN_你好世界_sentence'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockUnitOfMeaningData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    await fetchRemoteUnitOfMeaningByUID(unitUid)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/zh-CN/${unitUid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })
}) 