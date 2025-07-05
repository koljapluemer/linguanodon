import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLearningGoalStore } from './learningGoalStore'
import type { LearningGoalData } from '@/entities/LearningGoalData'

// Mock crypto.randomUUID to return different UUIDs
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`
})

describe('LearningGoal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset UUID counter for each test
    uuidCounter = 0
  })

  describe('createLearningGoal', () => {
    it('should create a new learning goal with auto-generated UID', () => {
      const store = useLearningGoalStore()
      const goalData: Omit<LearningGoalData, 'uid'> = {
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      }

      const result = store.createLearningGoal(goalData)

      expect(result).toEqual({
        ...goalData,
        uid: 'test-uuid-1'
      })
      expect(store.learningGoals).toHaveLength(1)
      expect(store.learningGoals[0]).toEqual(result)
    })

    it('should add multiple learning goals correctly', () => {
      const store = useLearningGoalStore()
      const goal1: Omit<LearningGoalData, 'uid'> = {
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      }
      const goal2: Omit<LearningGoalData, 'uid'> = {
        name: 'Learn French',
        parents: [],
        blockedBy: [],
        language: 'fr',
        unitsOfMeaning: [],
        userCreated: false
      }

      const created1 = store.createLearningGoal(goal1)
      const created2 = store.createLearningGoal(goal2)

      expect(store.learningGoals).toHaveLength(2)
      expect(store.learningGoals[0].name).toBe('Learn Spanish')
      expect(store.learningGoals[1].name).toBe('Learn French')
      expect(created1.uid).toBe('test-uuid-1')
      expect(created2.uid).toBe('test-uuid-2')
    })
  })

  describe('getLearningGoal', () => {
    it('should return undefined for non-existent UID', () => {
      const store = useLearningGoalStore()
      const result = store.getLearningGoal('non-existent')
      expect(result).toBeUndefined()
    })

    it('should return the correct learning goal by UID', () => {
      const store = useLearningGoalStore()
      const goalData: Omit<LearningGoalData, 'uid'> = {
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      }

      const created = store.createLearningGoal(goalData)
      const result = store.getLearningGoal(created.uid)

      expect(result).toEqual(created)
    })
  })

  describe('getAllLearningGoals', () => {
    it('should return empty array when no goals exist', () => {
      const store = useLearningGoalStore()
      const result = store.getAllLearningGoals()
      expect(result).toEqual([])
    })

    it('should return all learning goals', () => {
      const store = useLearningGoalStore()
      store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)
      store.createLearningGoal({
        name: 'Learn French',
        parents: [],
        blockedBy: [],
        language: 'fr',
        unitsOfMeaning: [],
        userCreated: false
      } as Omit<LearningGoalData, 'uid'>)

      const result = store.getAllLearningGoals()

      expect(result).toHaveLength(2)
      expect(result.map(g => g.name)).toEqual(['Learn Spanish', 'Learn French'])
      expect(result.map(g => g.language)).toEqual(['es', 'fr'])
    })
  })

  describe('getLearningGoalsByLanguage', () => {
    it('should return empty array for non-existent language', () => {
      const store = useLearningGoalStore()
      const result = store.getLearningGoalsByLanguage('non-existent')
      expect(result).toEqual([])
    })

    it('should return goals filtered by language', () => {
      const store = useLearningGoalStore()
      store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)
      store.createLearningGoal({
        name: 'Learn French',
        parents: [],
        blockedBy: [],
        language: 'fr',
        unitsOfMeaning: [],
        userCreated: false
      } as Omit<LearningGoalData, 'uid'>)
      store.createLearningGoal({
        name: 'Master Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      const spanishGoals = store.getLearningGoalsByLanguage('es')
      const frenchGoals = store.getLearningGoalsByLanguage('fr')

      expect(spanishGoals).toHaveLength(2)
      expect(spanishGoals.map(g => g.name)).toEqual(['Learn Spanish', 'Master Spanish'])
      expect(frenchGoals).toHaveLength(1)
      expect(frenchGoals[0].name).toBe('Learn French')
    })
  })

  describe('updateLearningGoal', () => {
    it('should throw error for non-existent UID', () => {
      const store = useLearningGoalStore()
      expect(() => {
        store.updateLearningGoal('non-existent', { name: 'Updated' })
      }).toThrow('Learning goal not found')
    })

    it('should update existing learning goal', () => {
      const store = useLearningGoalStore()
      const goal = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      const result = store.updateLearningGoal(goal.uid, {
        name: 'Master Spanish',
        language: 'es-ES'
      })

      expect(result.name).toBe('Master Spanish')
      expect(result.language).toBe('es-ES')
      expect(result.parents).toEqual([]) // Should preserve other fields
      expect(result.userCreated).toBe(true)
      expect(store.learningGoals[0]).toEqual(result)
    })

    it('should update multiple fields at once', () => {
      const store = useLearningGoalStore()
      const goal = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      const result = store.updateLearningGoal(goal.uid, {
        name: 'Master Spanish',
        language: 'es-ES',
        parents: ['parent-1'],
        blockedBy: ['blocker-1'],
        unitsOfMeaning: ['unit-1', 'unit-2']
      })

      expect(result.name).toBe('Master Spanish')
      expect(result.language).toBe('es-ES')
      expect(result.parents).toEqual(['parent-1'])
      expect(result.blockedBy).toEqual(['blocker-1'])
      expect(result.unitsOfMeaning).toEqual(['unit-1', 'unit-2'])
    })

    it('should handle partial updates with undefined values', () => {
      const store = useLearningGoalStore()
      const goal = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: ['parent-1'],
        blockedBy: ['blocker-1'],
        language: 'es',
        unitsOfMeaning: ['unit-1'],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      const result = store.updateLearningGoal(goal.uid, {
        parents: undefined as string[] | undefined,
        blockedBy: undefined as string[] | undefined
      })

      expect(result.parents).toBeUndefined()
      expect(result.blockedBy).toBeUndefined()
      expect(result.name).toBe('Learn Spanish') // Other fields preserved
    })
  })

  describe('deleteLearningGoal', () => {
    it('should throw error for non-existent UID', () => {
      const store = useLearningGoalStore()
      expect(() => {
        store.deleteLearningGoal('non-existent')
      }).toThrow('Learning goal not found')
    })

    it('should delete existing learning goal', () => {
      const store = useLearningGoalStore()
      const goal1 = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)
      const goal2 = store.createLearningGoal({
        name: 'Learn French',
        parents: [],
        blockedBy: [],
        language: 'fr',
        unitsOfMeaning: [],
        userCreated: false
      } as Omit<LearningGoalData, 'uid'>)

      expect(store.learningGoals).toHaveLength(2)

      store.deleteLearningGoal(goal1.uid)

      expect(store.learningGoals).toHaveLength(1)
      expect(store.learningGoals[0]).toEqual(goal2)
      expect(store.getLearningGoal(goal1.uid)).toBeUndefined()
    })

    it('should handle deleting the last goal', () => {
      const store = useLearningGoalStore()
      const goal = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      store.deleteLearningGoal(goal.uid)

      expect(store.learningGoals).toHaveLength(0)
      expect(store.getAllLearningGoals()).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle empty updates', () => {
      const store = useLearningGoalStore()
      const goal = store.createLearningGoal({
        name: 'Learn Spanish',
        parents: [],
        blockedBy: [],
        language: 'es',
        unitsOfMeaning: [],
        userCreated: true
      } as Omit<LearningGoalData, 'uid'>)

      const result = store.updateLearningGoal(goal.uid, {})

      expect(result).toEqual(goal)
    })
  })
}) 