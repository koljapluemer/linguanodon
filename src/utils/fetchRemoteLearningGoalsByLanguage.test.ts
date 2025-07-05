import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchRemoteLearningGoalsByLanguage } from './fetchRemoteLearningGoalsByLanguage'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchRemoteLearningGoalsByLanguage', () => {
  // Real data structure from the API
  const mockLearningGoalSummaries: LearningGoalSummary[] = [
    {
      uid: "apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27",
      name: "Understand 'ما بعرفش'"
    },
    {
      uid: "apc_Understand%20%27%D8%B9%D9%86%D8%AF%D9%8A%20%D8%A8%D8%B3%D8%A9%27",
      name: "Understand 'عندي بسة'"
    },
    {
      uid: "apc_Know%20how%20to%20translate%20%27cat%27",
      name: "Know how to translate 'cat'"
    }
  ]

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return learning goal summaries successfully', async () => {
    const language = 'apc'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockLearningGoalSummaries)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalsByLanguage(language)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    expect(mockResponse.json).toHaveBeenCalledOnce()
    expect(result).toEqual(mockLearningGoalSummaries)
  })

  it('should construct URL correctly for different languages', async () => {
    const languages = ['en', 'es', 'fr', 'apc']
    
    for (const language of languages) {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([])
      }
      mockFetch.mockResolvedValue(mockResponse)

      await fetchRemoteLearningGoalsByLanguage(language)

      const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    }
  })

  it('should throw error when response is not ok', async () => {
    const language = 'apc'
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteLearningGoalsByLanguage(language)).rejects.toThrow(`Failed to fetch remote learning goals for ${language}`)
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when fetch fails', async () => {
    const language = 'apc'
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValue(networkError)

    await expect(fetchRemoteLearningGoalsByLanguage(language)).rejects.toThrow('Network error')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when json parsing fails', async () => {
    const language = 'apc'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteLearningGoalsByLanguage(language)).rejects.toThrow('Invalid JSON')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle empty learning goals array', async () => {
    const language = 'apc'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue([])
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalsByLanguage(language)

    expect(result).toEqual([])
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle learning goals with URL-encoded names', async () => {
    const language = 'apc'
    const goalsWithEncodedNames: LearningGoalSummary[] = [
      {
        uid: "apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27",
        name: "Understand 'ما بعرفش'"
      }
    ]

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(goalsWithEncodedNames)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalsByLanguage(language)

    expect(result).toEqual(goalsWithEncodedNames)
    expect(result[0].uid).toContain('%')
    expect(result[0].name).toContain('ما بعرفش')
  })

  it('should handle special characters in language parameter', async () => {
    const language = 'zh-CN'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue([])
    }
    mockFetch.mockResolvedValue(mockResponse)

    await fetchRemoteLearningGoalsByLanguage(language)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })
}) 