import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateExercisesForTask } from './generateExercisesForTask'
import type { Task } from '@/entities/Task'
import type { Language } from '@/entities/Language'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { createEmptyCard } from 'ts-fsrs'

// Mocks for exercise generators
vi.mock('./generators/generateClozesForUnitAndLanguage', () => ({
  generateClozesForUnitAndLanguage: vi.fn(() => [{ type: 'cloze' }])
}))
vi.mock('./generators/generateChooseFromTwoForUnitAndLanguage', () => ({
  generateChooseFromTwoForUnitAndLanguage: vi.fn(() => Promise.resolve([{ type: 'chooseFromTwo' }]))
}))
vi.mock('./generators/generateFreeTranslationForUnitAndLanguage', () => ({
  generateFreeTranslationForUnitAndLanguage: vi.fn(() => Promise.resolve([{ type: 'freeTranslation' }]))
}))

describe('generateExercisesForTask', () => {
  let mockUnitRepository: UnitOfMeaningRepository
  let mockTask: Task
  let targetLanguages: Language[]
  let nativeLanguages: Language[]
  let mockUnit: UnitOfMeaning

  beforeEach(() => {
    mockUnit = {
      language: 'en',
      content: 'hello',
      translations: [],
      seeAlso: [],
      explicitlyNotRelated: [],
      credits: [{ license: 'MIT' }],
      links: [],
      card: createEmptyCard()
    } as UnitOfMeaning

    mockUnitRepository = {
      findUnitOfMeaning: vi.fn(() => Promise.resolve(mockUnit)),
      // ...other methods if needed
    } as unknown as UnitOfMeaningRepository

    mockTask = {
      language: 'en',
      content: 'mock content',
      uid: 'task-1',
      primaryUnitsOfMeaning: [
        { language: 'en', content: 'hello' }
      ],
      secondaryUnitsOfMeaning: [],
      lastDownloadedAt: null,
      lastPracticedAt: null,
      isCompleted: false,
      nextShownEarliestAt: new Date(),
      interval: 1,
      attempts: []
    }

    targetLanguages = [
      { code: 'de', name: 'German' }
    ] as Language[]
    nativeLanguages = [
      { code: 'en', name: 'English' }
    ] as Language[]
  })

  it('returns an array with at least one exercise', async () => {
    const exercises = await generateExercisesForTask(
      mockTask,
      targetLanguages,
      nativeLanguages,
      mockUnitRepository,
      'primary',
      false // do not limit for test
    )
    expect(Array.isArray(exercises)).toBe(true)
    expect(exercises.length).toBeGreaterThan(0)
  })
}) 