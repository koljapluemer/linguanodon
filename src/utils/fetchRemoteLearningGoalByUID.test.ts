import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchRemoteLearningGoalByUID } from './fetchRemoteLearningGoalByUID'
import type { LearningGoalData } from '@/entities/LearningGoalData'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchRemoteLearningGoalByUID', () => {
  // Real data structure from the API
  const mockLearningGoalData: LearningGoalData = {
    uid: "apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27",
    name: "Understand 'ما بعرفش'",
    language: "apc",
    unitsOfMeaning: ["apc_%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4_sentence"],
    parents: [],
    blockedBy: [],
    userCreated: false
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return learning goal data successfully', async () => {
    const language = 'apc'
    const uid = "apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27"
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockLearningGoalData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalByUID(language, uid)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    expect(mockResponse.json).toHaveBeenCalledOnce()
    expect(result).toEqual(mockLearningGoalData)
  })

  it('should construct URL correctly for different languages and UIDs', async () => {
    const testCases = [
      { language: 'en', uid: 'en_basic_greetings' },
      { language: 'es', uid: 'es_advanced_grammar' },
      { language: 'apc', uid: 'apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27' }
    ]
    
    for (const { language, uid } of testCases) {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockLearningGoalData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await fetchRemoteLearningGoalByUID(language, uid)

      const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
    }
  })

  it('should throw error when response is not ok', async () => {
    const language = 'apc'
    const uid = 'apc_nonexistent_goal'
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteLearningGoalByUID(language, uid)).rejects.toThrow(`Failed to fetch remote learning goal ${uid} for ${language}`)
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when fetch fails', async () => {
    const language = 'apc'
    const uid = 'apc_test_goal'
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValue(networkError)

    await expect(fetchRemoteLearningGoalByUID(language, uid)).rejects.toThrow('Network error')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should throw error when json parsing fails', async () => {
    const language = 'apc'
    const uid = 'apc_test_goal'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    }
    mockFetch.mockResolvedValue(mockResponse)

    await expect(fetchRemoteLearningGoalByUID(language, uid)).rejects.toThrow('Invalid JSON')
    
    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle learning goal with URL-encoded UID', async () => {
    const language = 'apc'
    const uid = "apc_Understand%20%27%D9%85%D8%A7%20%D8%A8%D8%B9%D8%B1%D9%81%D8%B4%27"
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockLearningGoalData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalByUID(language, uid)

    expect(result).toEqual(mockLearningGoalData)
    expect(result.uid).toContain('%')
    expect(result.name).toContain('ما بعرفش')
    expect(result.unitsOfMeaning[0]).toContain('%')
  })

  it('should handle learning goal with empty arrays', async () => {
    const language = 'en'
    const uid = 'en_empty_goal'
    const emptyGoalData: LearningGoalData = {
      uid: uid,
      name: 'Empty Goal',
      language: language,
      unitsOfMeaning: [],
      parents: [],
      blockedBy: [],
      userCreated: true
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(emptyGoalData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalByUID(language, uid)

    expect(result).toEqual(emptyGoalData)
    expect(result.unitsOfMeaning).toEqual([])
    expect(result.parents).toEqual([])
    expect(result.blockedBy).toEqual([])
  })

  it('should handle learning goal with populated arrays', async () => {
    const language = 'en'
    const uid = 'en_populated_goal'
    const populatedGoalData: LearningGoalData = {
      uid: uid,
      name: 'Populated Goal',
      language: language,
      unitsOfMeaning: ['en_unit_1', 'en_unit_2'],
      parents: ['en_parent_goal'],
      blockedBy: ['en_blocking_goal'],
      userCreated: false
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(populatedGoalData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await fetchRemoteLearningGoalByUID(language, uid)

    expect(result).toEqual(populatedGoalData)
    expect(result.unitsOfMeaning).toHaveLength(2)
    expect(result.parents).toHaveLength(1)
    expect(result.blockedBy).toHaveLength(1)
  })

  it('should handle special characters in language and UID parameters', async () => {
    const language = 'zh-CN'
    const uid = 'zh-CN_特殊字符_goal'
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockLearningGoalData)
    }
    mockFetch.mockResolvedValue(mockResponse)

    await fetchRemoteLearningGoalByUID(language, uid)

    const expectedUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })
}) 