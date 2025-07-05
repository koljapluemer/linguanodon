import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchCanonicalLanguages } from './fetchCanonicalLanguages'
import type { Language } from '@/entities/Language'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchCanonicalLanguages', () => {
  // Real data structure from the API
  const mockLanguages: Language[] = [
    {
      tag: 'en',
      name: 'English',
      abbreviation: '🇬🇧'
    },
    {
      tag: 'es',
      name: 'Castilian',
      abbreviation: '🇪🇸'
    },
    {
      tag: 'fr',
      name: 'French',
      abbreviation: '🇫🇷'
    },
    {
      tag: 'de',
      name: 'German',
      abbreviation: '🇩🇪'
    },
    {
      tag: 'apc',
      name: 'North Levantine Arabic'
    }
  ]

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return canonical languages successfully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockLanguages)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchCanonicalLanguages()

    expect(mockFetch).toHaveBeenCalledWith('https://scintillating-empanada-730581.netlify.app/language_tags.json')
    expect(mockResponse.json).toHaveBeenCalledOnce()
    expect(result).toEqual(mockLanguages)
  })

  it('should throw error when response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchCanonicalLanguages()).rejects.toThrow('Failed to fetch canonical language list')
    expect(mockFetch).toHaveBeenCalledWith('https://scintillating-empanada-730581.netlify.app/language_tags.json')
  })

  it('should throw error when fetch fails', async () => {
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValue(networkError)

    await expect(fetchCanonicalLanguages()).rejects.toThrow('Network error')
    expect(mockFetch).toHaveBeenCalledWith('https://scintillating-empanada-730581.netlify.app/language_tags.json')
  })

  it('should throw error when json parsing fails', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchCanonicalLanguages()).rejects.toThrow('Invalid JSON')
    expect(mockFetch).toHaveBeenCalledWith('https://scintillating-empanada-730581.netlify.app/language_tags.json')
  })

  it('should handle empty language array', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue([])
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchCanonicalLanguages()

    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('https://scintillating-empanada-730581.netlify.app/language_tags.json')
  })

  it('should handle languages without abbreviation', async () => {
    const languagesWithoutAbbreviation: Language[] = [
      {
        tag: 'apc',
        name: 'North Levantine Arabic'
      },
      {
        tag: 'aa',
        name: 'Afar'
      }
    ]

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(languagesWithoutAbbreviation)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchCanonicalLanguages()

    expect(result).toEqual(languagesWithoutAbbreviation)
    expect(result[0].abbreviation).toBeUndefined()
    expect(result[1].abbreviation).toBeUndefined()
  })

  it('should handle languages with emoji abbreviations', async () => {
    const languagesWithEmoji: Language[] = [
      {
        tag: 'en',
        name: 'English',
        abbreviation: '🇬🇧'
      },
      {
        tag: 'es',
        name: 'Castilian',
        abbreviation: '🇪🇸'
      }
    ]

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(languagesWithEmoji)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchCanonicalLanguages()

    expect(result).toEqual(languagesWithEmoji)
    expect(result[0].abbreviation).toBe('🇬🇧')
    expect(result[1].abbreviation).toBe('🇪🇸')
  })
}) 