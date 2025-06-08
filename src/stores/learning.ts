import { defineStore } from 'pinia'
import PouchDB from 'pouchdb/dist/pouchdb'
import type { LearningGoal, UnitOfMeaning, Exercise } from '@/types/learning'
import { useExerciseGenerator } from '@/composables/useExerciseGenerator'

// Create database instance with IndexedDB adapter
const db = new PouchDB('linguanodon-learning', { adapter: 'idb' })
const exerciseGenerator = useExerciseGenerator()

// Type guard to ensure document has required PouchDB fields
function hasPouchDBFields<T extends { _id?: string; _rev?: string }>(
  doc: T
): doc is T & { _id: string; _rev: string } {
  return typeof doc._id === 'string' && typeof doc._rev === 'string'
}

export const useLearningStore = defineStore('learning', {
  state: () => ({
    currentGoal: null as LearningGoal | null,
    goals: [] as LearningGoal[],
    unitsOfMeaning: [] as UnitOfMeaning[],
    exercises: [] as Exercise[]
  }),

  getters: {
    mainGoals: (state) => state.goals.filter(g => !g.parentIds || g.parentIds.length === 0),
    childGoals: (state) => (parentId: string) => 
      state.goals.filter(g => g.parentIds?.includes(parentId))
  },

  actions: {
    async init() {
      try {
        // Use allDocs instead of find for initial queries
        const goals = await db.allDocs({
          include_docs: true,
          startkey: 'learning_goal',
          endkey: 'learning_goal\ufff0'
        })
        this.goals = goals.rows
          .filter(row => row.doc && hasPouchDBFields(row.doc))
          .map(row => row.doc as LearningGoal)

        const units = await db.allDocs({
          include_docs: true,
          startkey: 'unit_of_meaning',
          endkey: 'unit_of_meaning\ufff0'
        })
        this.unitsOfMeaning = units.rows
          .filter(row => row.doc && hasPouchDBFields(row.doc))
          .map(row => row.doc as UnitOfMeaning)

        const exercises = await db.allDocs({
          include_docs: true,
          startkey: 'exercise',
          endkey: 'exercise\ufff0'
        })
        this.exercises = exercises.rows
          .filter(row => row.doc && hasPouchDBFields(row.doc))
          .map(row => row.doc as Exercise)
      } catch (error) {
        console.error('Failed to initialize store:', error)
      }
    },

    async createGoal(goal: Omit<LearningGoal, '_id' | '_rev'>) {
      try {
        const doc = await db.post({
          ...goal,
          type: 'learning_goal',
          parentIds: goal.parentIds || []
        })
        const newGoal = { ...goal, _id: doc.id, _rev: doc.rev } as LearningGoal
        this.goals.push(newGoal)
        return newGoal
      } catch (error) {
        console.error('Failed to create goal:', error)
        throw error
      }
    },

    async createUnitOfMeaning(unit: Omit<UnitOfMeaning, '_id' | '_rev'>) {
      try {
        const doc = await db.post({
          ...unit,
          type: 'unit_of_meaning'
        })
        const newUnit = { ...unit, _id: doc.id, _rev: doc.rev } as UnitOfMeaning
        this.unitsOfMeaning.push(newUnit)
        
        // Generate exercises for the new unit
        const exercises = exerciseGenerator.generateExercises(newUnit)
        for (const exercise of exercises) {
          await this.createExercise(exercise)
        }
        
        return newUnit
      } catch (error) {
        console.error('Failed to create unit of meaning:', error)
        throw error
      }
    },

    async createExercise(exercise: Omit<Exercise, '_id' | '_rev'>) {
      try {
        const doc = await db.post({
          ...exercise,
          type: 'exercise'
        })
        const newExercise = { ...exercise, _id: doc.id, _rev: doc.rev } as Exercise
        this.exercises.push(newExercise)
        return newExercise
      } catch (error) {
        console.error('Failed to create exercise:', error)
        throw error
      }
    },

    async deleteExercise(exerciseId: string) {
      try {
        const exercise = this.exercises.find(e => e._id === exerciseId)
        if (!exercise || !hasPouchDBFields(exercise)) {
          throw new Error('Exercise not found or invalid')
        }
        
        await db.remove(exercise)
        this.exercises = this.exercises.filter(e => e._id !== exerciseId)
      } catch (error) {
        console.error('Failed to delete exercise:', error)
        throw error
      }
    },

    async deleteUnitOfMeaning(unitId: string) {
      try {
        const unit = this.unitsOfMeaning.find(u => u._id === unitId)
        if (!unit || !hasPouchDBFields(unit)) {
          throw new Error('Unit of meaning not found or invalid')
        }
        
        // Delete all associated exercises first
        const exercises = this.getExercisesForUnit(unitId)
        for (const exercise of exercises) {
          if (hasPouchDBFields(exercise)) {
            await this.deleteExercise(exercise._id)
          }
        }
        
        await db.remove(unit)
        this.unitsOfMeaning = this.unitsOfMeaning.filter(u => u._id !== unitId)
      } catch (error) {
        console.error('Failed to delete unit of meaning:', error)
        throw error
      }
    },

    async deleteGoal(goalId: string) {
      try {
        const goal = this.goals.find(g => g._id === goalId)
        if (!goal || !hasPouchDBFields(goal)) {
          throw new Error('Goal not found or invalid')
        }
        
        // Delete all child goals first
        const childGoals = this.goals.filter(g => g.parentIds?.includes(goalId))
        for (const childGoal of childGoals) {
          if (hasPouchDBFields(childGoal)) {
            await this.deleteGoal(childGoal._id)
          }
        }
        
        // Delete all associated units and their exercises
        const units = this.unitsOfMeaning.filter(u => u.subGoalId === goalId)
        for (const unit of units) {
          if (hasPouchDBFields(unit)) {
            await this.deleteUnitOfMeaning(unit._id)
          }
        }
        
        await db.remove(goal)
        this.goals = this.goals.filter(g => g._id !== goalId)
      } catch (error) {
        console.error('Failed to delete goal:', error)
        throw error
      }
    },

    async markExerciseDone(exerciseId: string) {
      try {
        const exercise = this.exercises.find(e => e._id === exerciseId)
        if (!exercise || !hasPouchDBFields(exercise)) {
          throw new Error('Exercise not found or invalid')
        }
        
        const updatedExercise = { ...exercise, done: true }
        await db.put(updatedExercise)
        this.exercises = this.exercises.map(e => 
          e._id === exerciseId ? updatedExercise : e
        )
      } catch (error) {
        console.error('Failed to mark exercise as done:', error)
        throw error
      }
    },

    getExercisesForUnit(unitId: string) {
      return this.exercises.filter(e => e.unitId === unitId)
    },

    getExercisesForGoal(goalId: string) {
      const units = this.unitsOfMeaning.filter(u => u.subGoalId === goalId)
      return this.exercises.filter(e => 
        units.some(u => u._id === e.unitId)
      )
    }
  }
}) 