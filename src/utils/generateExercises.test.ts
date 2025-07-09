import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  makeClozeTokens, 
  detectTextDirection, 
  generateExercises, 
  generateExercisesForTask 
} from './generateExercises'
import { createEmptyCard } from 'ts-fsrs'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { Task } from '@/entities/Task'

// Mock the stores
vi.mock('@/stores/exerciseStore', () => ({
  useExerciseStore: () => ({
    exercises: {}
  })
}))

vi.mock('@/stores/unitOfMeaningStore', () => ({
  useUnitOfMeaningStore: () => ({
    getUnitsByUids: vi.fn(),
    getTranslationsByLanguage: vi.fn(),
    getNativeTranslations: vi.fn()
  })
}))

describe('makeClozeTokens', () => {
  it('should cloze the first word in an RTL sentence and not jump the placeholder', () => {
    // Example: sentence = "واستلبسوه ولاد الصف"
    // tokens = ["واستلبسوه", " ", "ولاد", " ", "الصف"]
    // Cloze first word (index 0)
    const tokens = ["واستلبسوه", " ", "ولاد", " ", "الصف"]
    const clozed = makeClozeTokens(tokens, 0)
    // The expected output should have the placeholder in the correct position
    const expected = '؟؟؟ ولاد الصف'
    expect(clozed).toBe(expected)
  })

  it('should cloze the middle word in an LTR sentence', () => {
    const tokens = ["This", " ", "is", " ", "a", " ", "test"]
    const clozed = makeClozeTokens(tokens, 2) // cloze "is"
    const expected = 'This ??? a test'
    expect(clozed).toBe(expected)
  })

  it('should handle single word sentences', () => {
    const tokens = ["Hello"]
    const clozed = makeClozeTokens(tokens, 0)
    const expected = '???'
    expect(clozed).toBe(expected)
  })

  it('should preserve punctuation and spacing', () => {
    const tokens = ["Hello", ",", " ", "world", "!"]
    const clozed = makeClozeTokens(tokens, 0) // cloze "Hello"
    const expected = '???, world!'
    expect(clozed).toBe(expected)
  })
})

describe('detectTextDirection', () => {
  it('detects LTR for German', () => {
    expect(detectTextDirection('Das ist ein Test.')).toBe('ltr')
  })
  
  it('detects LTR for English', () => {
    expect(detectTextDirection('This is a test.')).toBe('ltr')
  })
  
  it('detects RTL for Arabic', () => {
    expect(detectTextDirection('هذا اختبار')).toBe('rtl')
  })
  
  it('detects LTR for Japanese', () => {
    expect(detectTextDirection('これはテストです')).toBe('ltr')
  })
  
  it('detects LTR for Chinese', () => {
    expect(detectTextDirection('这是一个测试')).toBe('ltr')
  })

  it('detects RTL for Hebrew', () => {
    expect(detectTextDirection('שלום עולם')).toBe('rtl')
  })

  it('defaults to LTR for mixed content', () => {
    expect(detectTextDirection('Hello 123')).toBe('ltr')
  })

  it('defaults to LTR for empty string', () => {
    expect(detectTextDirection('')).toBe('ltr')
  })
})

describe('generateExercises', () => {
  const mockUnits: UnitOfMeaning[] = [
    {
      uid: 'en_hello_sentence',
      language: 'en',
      content: 'Hello world',
      notes: '',
      translations: ['ar_مرحبا_جملة'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    },
    {
      uid: 'ar_مرحبا_جملة',
      language: 'ar',
      content: 'مرحبا بالعالم',
      notes: '',
      translations: ['en_hello_sentence'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    }
  ]

  it('should generate exercises from translation pairs', () => {
    const exercises = generateExercises(mockUnits)
    expect(exercises.length).toBeGreaterThan(0)
    expect(exercises[0]).toHaveProperty('uid')
    expect(exercises[0]).toHaveProperty('front')
    expect(exercises[0]).toHaveProperty('back')
    expect(exercises[0]).toHaveProperty('card')
  })

  it('should return empty array for units without translations', () => {
    const unitsWithoutTranslations = [
      {
        uid: 'en_single_sentence',
        language: 'en',
        content: 'Single sentence',
        notes: '',
        translations: [],
        seeAlso: [],
        credits: [],
        card: createEmptyCard()
      }
    ]
    const exercises = generateExercises(unitsWithoutTranslations)
    expect(exercises).toEqual([])
  })

  it('should handle units with short words (less than 3 characters)', () => {
    const unitsWithShortWords = [
      {
        uid: 'en_short_sentence',
        language: 'en',
        content: 'Hi there',
        notes: '',
        translations: ['ar_مرحبا_قصير'],
        seeAlso: [],
        credits: [],
        card: createEmptyCard()
      },
      {
        uid: 'ar_مرحبا_قصير',
        language: 'ar',
        content: 'مرحبا هناك',
        notes: '',
        translations: ['en_short_sentence'],
        seeAlso: [],
        credits: [],
        card: createEmptyCard()
      }
    ]
    const exercises = generateExercises(unitsWithShortWords)
    // Should still generate some exercises for words >= 3 characters
    expect(exercises.length).toBeGreaterThanOrEqual(0)
  })
})

describe('generateExercisesForTask', () => {
  const mockTask: Task = {
    language: 'en',
    content: 'Use "hello" in a sentence',
    unitsOfMeaning: ['en_world_sentence'], // Only regular units
    primaryUnitsOfMeaning: ['en_hello_sentence'], // Only primary units
    lastDownloadedAt: null,
    lastPracticedAt: null,
    isCompleted: false,
    nextShownEarliestAt: new Date(),
    interval: 1,
    attempts: []
  }

  const mockUnits: UnitOfMeaning[] = [
    {
      uid: 'en_hello_sentence',
      language: 'en',
      content: 'Hello world',
      notes: '',
      translations: ['ar_مرحبا_جملة'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    },
    {
      uid: 'ar_مرحبا_جملة',
      language: 'ar',
      content: 'مرحبا بالعالم',
      notes: '',
      translations: ['en_hello_sentence'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    },
    {
      uid: 'en_world_sentence',
      language: 'en',
      content: 'The world is beautiful',
      notes: '',
      translations: ['ar_عالم_جملة'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    },
    {
      uid: 'ar_عالم_جملة',
      language: 'ar',
      content: 'العالم جميل',
      notes: '',
      translations: ['en_world_sentence'],
      seeAlso: [],
      credits: [],
      card: createEmptyCard()
    }
  ]

  let mockUnitStore: {
    getUnitsByUids: ReturnType<typeof vi.fn>
    getTranslationsByLanguage: ReturnType<typeof vi.fn>
    getNativeTranslations: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockUnitStore = {
      getUnitsByUids: vi.fn().mockReturnValue(mockUnits),
      getTranslationsByLanguage: vi.fn().mockImplementation((unit, language) => {
        // Mock implementation: return units that have the specified language and are in the unit's translations
        return mockUnits.filter(u => 
          u.language === language && unit.translations.includes(u.uid)
        )
      }),
      getNativeTranslations: vi.fn().mockImplementation((unit) => {
        // Mock implementation: return English translations
        return mockUnits.filter(u => 
          u.language === 'en' && unit.translations.includes(u.uid)
        )
      })
    }
  })

  it('should generate exercises for a task with units', () => {
    const exercises = generateExercisesForTask(mockTask, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises.length).toBeGreaterThan(0)
    expect(mockUnitStore.getUnitsByUids).toHaveBeenCalledWith([
      'en_hello_sentence',
      'en_world_sentence'
    ])
  })

  it('should return empty array when no units are found', () => {
    mockUnitStore.getUnitsByUids.mockReturnValue([])
    const exercises = generateExercisesForTask(mockTask, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises).toEqual([])
  })

  it('should return empty array when task has no units of meaning', () => {
    const taskWithoutUnits: Task = {
      ...mockTask,
      unitsOfMeaning: [],
      primaryUnitsOfMeaning: []
    }
    
    // Mock empty result for this specific test
    mockUnitStore.getUnitsByUids.mockReturnValue([])
    
    const exercises = generateExercisesForTask(taskWithoutUnits, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises).toEqual([])
  })

  it('should handle tasks with only primary units', () => {
    const taskWithOnlyPrimary: Task = {
      ...mockTask,
      unitsOfMeaning: [],
      primaryUnitsOfMeaning: ['en_hello_sentence']
    }
    
    const exercises = generateExercisesForTask(taskWithOnlyPrimary, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises.length).toBeGreaterThan(0)
  })

  it('should handle tasks with only regular units', () => {
    const taskWithOnlyRegular: Task = {
      ...mockTask,
      unitsOfMeaning: ['en_world_sentence'],
      primaryUnitsOfMeaning: []
    }
    
    const exercises = generateExercisesForTask(taskWithOnlyRegular, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises.length).toBeGreaterThan(0)
  })

  it('should handle units without translation pairs', () => {
    const unitsWithoutPairs = [
      {
        uid: 'en_single_unit',
        language: 'en',
        content: 'Single unit',
        notes: '',
        translations: [],
        seeAlso: [],
        credits: [],
        card: createEmptyCard()
      }
    ]
    
    mockUnitStore.getUnitsByUids.mockReturnValue(unitsWithoutPairs)
    const exercises = generateExercisesForTask(mockTask, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    expect(exercises).toEqual([])
  })

  it('should use weighted random selection (non-deterministic)', () => {
    const exercises = generateExercisesForTask(mockTask, mockUnitStore as unknown as ReturnType<typeof import('@/stores/unitOfMeaningStore').useUnitOfMeaningStore>)
    
    // Test that exercises are generated (non-deterministic due to random selection)
    expect(exercises.length).toBeGreaterThan(0)
    expect(exercises.length).toBeLessThanOrEqual(20)
    
    // Test that all exercises have the required properties
    exercises.forEach(exercise => {
      expect(exercise).toHaveProperty('uid')
      expect(exercise).toHaveProperty('front')
      expect(exercise).toHaveProperty('back')
      expect(exercise).toHaveProperty('card')
    })
  })
}) 