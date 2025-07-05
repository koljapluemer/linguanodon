import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { downloadRemoteLearningGoal, fetchRemoteLearningGoalData } from './downloadRemoteLearningGoal'
import { fetchRemoteLearningGoalByUID } from './fetchRemoteLearningGoalByUID'
import { fetchRemoteUnitOfMeaningByUID } from './fetchRemoteUnitOfMeaningByUID'

// Mock the fetch utilities
vi.mock('./fetchRemoteLearningGoalByUID')
vi.mock('./fetchRemoteUnitOfMeaningByUID')

const mockFetchRemoteLearningGoalByUID = vi.mocked(fetchRemoteLearningGoalByUID)
const mockFetchRemoteUnitOfMeaningByUID = vi.mocked(fetchRemoteUnitOfMeaningByUID)

describe('downloadRemoteLearningGoal', () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchRemoteLearningGoalData', () => {
    it('should fetch learning goal and all related units of meaning', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: ['es_hello', 'es_goodbye'],
        userCreated: false
      }

      const mockUnits = [
        {
          uid: 'es_hello',
          language: 'es',
          content: 'hola',
          linguType: 'word',
          translations: ['en_hello'],
          userCreated: false,
          context: 'greeting'
        },
        {
          uid: 'es_goodbye',
          language: 'es',
          content: 'adiós',
          linguType: 'word',
          translations: ['en_goodbye'],
          userCreated: false,
          context: 'farewell'
        }
      ]

      const mockTranslations = [
        {
          uid: 'en_hello',
          language: 'en',
          content: 'hello',
          linguType: 'word',
          translations: ['es_hello'],
          userCreated: false,
          context: 'greeting'
        },
        {
          uid: 'en_goodbye',
          language: 'en',
          content: 'goodbye',
          linguType: 'word',
          translations: ['es_goodbye'],
          userCreated: false,
          context: 'farewell'
        }
      ]

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)
      mockFetchRemoteUnitOfMeaningByUID
        .mockResolvedValueOnce(mockUnits[0])
        .mockResolvedValueOnce(mockUnits[1])
        .mockResolvedValueOnce(mockTranslations[0])
        .mockResolvedValueOnce(mockTranslations[1])

      const result = await fetchRemoteLearningGoalData('es', 'basic_greetings')

      expect(mockFetchRemoteLearningGoalByUID).toHaveBeenCalledWith('es', 'basic_greetings')
      expect(mockFetchRemoteUnitOfMeaningByUID).toHaveBeenCalledWith('es_hello')
      expect(mockFetchRemoteUnitOfMeaningByUID).toHaveBeenCalledWith('es_goodbye')
      expect(mockFetchRemoteUnitOfMeaningByUID).toHaveBeenCalledWith('en_hello')
      expect(mockFetchRemoteUnitOfMeaningByUID).toHaveBeenCalledWith('en_goodbye')

      expect(result).toEqual({
        learningGoal: mockLearningGoal,
        unitsOfMeaning: [...mockUnits, ...mockTranslations]
      })
    })

    it('should handle units without translations', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: ['es_hello'],
        userCreated: false
      }

      const mockUnit = {
        uid: 'es_hello',
        language: 'es',
        content: 'hola',
        linguType: 'word',
        translations: undefined,
        userCreated: false,
        context: 'greeting'
      }

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)
      mockFetchRemoteUnitOfMeaningByUID.mockResolvedValue(mockUnit)

      const result = await fetchRemoteLearningGoalData('es', 'basic_greetings')

      expect(result).toEqual({
        learningGoal: mockLearningGoal,
        unitsOfMeaning: [mockUnit]
      })
    })

    it('should handle duplicate translation UIDs', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: ['es_hello', 'es_hi'],
        userCreated: false
      }

      const mockUnits = [
        {
          uid: 'es_hello',
          language: 'es',
          content: 'hola',
          linguType: 'word',
          translations: ['en_hello'],
          userCreated: false,
          context: 'greeting'
        },
        {
          uid: 'es_hi',
          language: 'es',
          content: 'hola',
          linguType: 'word',
          translations: ['en_hello'], // Same translation
          userCreated: false,
          context: 'greeting'
        }
      ]

      const mockTranslation = {
        uid: 'en_hello',
        language: 'en',
        content: 'hello',
        linguType: 'word',
        translations: ['es_hello', 'es_hi'],
        userCreated: false,
        context: 'greeting'
      }

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)
      mockFetchRemoteUnitOfMeaningByUID
        .mockResolvedValueOnce(mockUnits[0])
        .mockResolvedValueOnce(mockUnits[1])
        .mockResolvedValueOnce(mockTranslation)

      const result = await fetchRemoteLearningGoalData('es', 'basic_greetings')

      // The function should deduplicate translation UIDs when fetching
      // So we should only have one unique translation UID across all units
      expect(result.unitsOfMeaning).toHaveLength(3) // 2 original units + 1 unique translation
      
      // Verify that the translation UID 'en_hello' appears only once in the final result
      const translationUids = result.unitsOfMeaning
        .filter(unit => unit.uid === 'en_hello')
        .map(unit => unit.uid)
      expect(translationUids).toHaveLength(1)
      expect(translationUids[0]).toBe('en_hello')
    })

    it('should handle fetch errors', async () => {
      mockFetchRemoteLearningGoalByUID.mockRejectedValue(new Error('Network error'))

      await expect(fetchRemoteLearningGoalData('es', 'basic_greetings')).rejects.toThrow('Network error')
    })
  })

  describe('downloadRemoteLearningGoal', () => {
    it('should download and add new items to stores', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: ['es_hello'],
        userCreated: false
      }

      const mockUnit = {
        uid: 'es_hello',
        language: 'es',
        content: 'hola',
        linguType: 'word',
        translations: ['en_hello'],
        userCreated: false,
        context: 'greeting'
      }

      const mockTranslation = {
        uid: 'en_hello',
        language: 'en',
        content: 'hello',
        linguType: 'word',
        translations: ['es_hello'],
        userCreated: false,
        context: 'greeting'
      }

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)
      mockFetchRemoteUnitOfMeaningByUID
        .mockResolvedValueOnce(mockUnit)
        .mockResolvedValueOnce(mockTranslation)

      await downloadRemoteLearningGoal('es', 'basic_greetings')

      const { useUnitOfMeaningStore } = await import('@/stores/unitOfMeaningStore')
      const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
      
      const unitStore = useUnitOfMeaningStore()
      const learningGoalStore = useLearningGoalStore()

      expect(unitStore.getUnitOfMeaningByContent('es', 'hola', 'word')).toBeDefined()
      expect(unitStore.getUnitOfMeaningByContent('en', 'hello', 'word')).toBeDefined()
      expect(unitStore.unitsOfMeaning.length).toBe(2)
      const allGoals = learningGoalStore.getAllLearningGoals()
      expect(allGoals.filter(g => g.uid === mockLearningGoal.uid).length).toBe(1)
    })

    it('should skip existing units of meaning', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: ['es_hello'],
        userCreated: false
      }

      const mockUnit = {
        uid: 'es_hello',
        language: 'es',
        content: 'hola',
        linguType: 'word',
        translations: [],
        userCreated: false,
        context: 'greeting'
      }

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)
      mockFetchRemoteUnitOfMeaningByUID.mockResolvedValue(mockUnit)

      const { useUnitOfMeaningStore } = await import('@/stores/unitOfMeaningStore')
      const unitStore = useUnitOfMeaningStore()
      unitStore.createUnitOfMeaning({
        ...mockUnit,
        lastDownloadedAt: new Date(),
        lastPracticedAt: undefined
      })
      const initialCount = unitStore.unitsOfMeaning.length
      await downloadRemoteLearningGoal('es', 'basic_greetings')
      expect(unitStore.unitsOfMeaning.length).toBe(initialCount)
    })

    it('should skip existing learning goal', async () => {
      const mockLearningGoal = {
        uid: 'es_basic_greetings',
        name: 'Basic Greetings',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: false
      }

      mockFetchRemoteLearningGoalByUID.mockResolvedValue(mockLearningGoal)

      const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
      const learningGoalStore = useLearningGoalStore()
      // Create learning goal with the same UID that the download function will check for
      learningGoalStore.createLearningGoalWithUID({
        ...mockLearningGoal,
        lastDownloadedAt: new Date(),
        lastPracticedAt: undefined
      })
      const initialCount = learningGoalStore.getAllLearningGoals().length
      await downloadRemoteLearningGoal('es', 'basic_greetings')
      expect(learningGoalStore.getAllLearningGoals().length).toBe(initialCount)
    })

    it('should handle errors and log them', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetchRemoteLearningGoalByUID.mockRejectedValue(new Error('Network error'))

      await expect(downloadRemoteLearningGoal('es', 'basic_greetings')).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to download learning goal basic_greetings for es:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
}) 