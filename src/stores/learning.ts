import { defineStore } from 'pinia'
import PouchDB from 'pouchdb/dist/pouchdb'
import type { LearningGoal, UnitOfMeaning, Exercise } from '@/types/learning'
import { useExerciseGenerator } from '@/composables/useExerciseGenerator'

// Create database instance with IndexedDB adapter
const db = new PouchDB('linguanodon-learning', { 
  adapter: 'idb',
  auto_compaction: true
})

// Enable PouchDB debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).PouchDB = PouchDB
  // Debug database info
  db.info().then(info => {
    console.log('Database info:', info)
  }).catch(err => {
    console.error('Failed to get database info:', err)
  })
}

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
    exercises: [] as Exercise[],
    isInitialized: false
  }),

  getters: {
    mainGoals: (state) => state.goals.filter(g => !g.parentIds || g.parentIds.length === 0),
    childGoals: (state) => (parentId: string) => 
      state.goals.filter(g => g.parentIds?.includes(parentId))
  },

  actions: {
    async init() {
      if (this.isInitialized) return

      try {
        console.log('Initializing store...')
        
        // Debug: List all documents
        const allDocs = await db.allDocs({ include_docs: true })
        console.log('All documents in database:', allDocs.rows.map(row => ({
          id: row.id,
          doc: row.doc ? {
            type: (row.doc as any).type,
            deleted: (row.doc as any)._deleted
          } : null
        })))

        // Load all documents and filter by type
        const goals = allDocs.rows
          .filter(row => row.doc && (row.doc as any).type === 'learning_goal')
          .map(row => row.doc as LearningGoal)
        console.log('Loaded goals:', goals.length)
        console.log('Goal documents:', goals)
        this.goals = goals

        const units = allDocs.rows
          .filter(row => row.doc && (row.doc as any).type === 'unit_of_meaning')
          .map(row => row.doc as UnitOfMeaning)
        console.log('Loaded units:', units.length)
        console.log('Unit documents:', units)
        this.unitsOfMeaning = units

        const exercises = allDocs.rows
          .filter(row => row.doc && (row.doc as any).type === 'exercise')
          .map(row => row.doc as Exercise)
        console.log('Loaded exercises:', exercises.length)
        console.log('Exercise documents:', exercises)
        this.exercises = exercises

        // Set up change listener
        db.changes({
          since: 'now',
          live: true,
          include_docs: true
        }).on('change', (change) => {
          console.log('Database change:', change)
          if (!change.doc) return
          
          const doc = change.doc as any
          if (doc.type === 'learning_goal') {
            if (change.deleted) {
              this.goals = this.goals.filter(g => g._id !== doc._id)
            } else if (hasPouchDBFields(doc)) {
              const index = this.goals.findIndex(g => g._id === doc._id)
              if (index === -1) {
                this.goals.push(doc as LearningGoal)
              } else {
                this.goals[index] = doc as LearningGoal
              }
            }
          } else if (doc.type === 'unit_of_meaning') {
            if (change.deleted) {
              this.unitsOfMeaning = this.unitsOfMeaning.filter(u => u._id !== doc._id)
            } else if (hasPouchDBFields(doc)) {
              const index = this.unitsOfMeaning.findIndex(u => u._id === doc._id)
              if (index === -1) {
                this.unitsOfMeaning.push(doc as UnitOfMeaning)
              } else {
                this.unitsOfMeaning[index] = doc as UnitOfMeaning
              }
            }
          } else if (doc.type === 'exercise') {
            if (change.deleted) {
              this.exercises = this.exercises.filter(e => e._id !== doc._id)
            } else if (hasPouchDBFields(doc)) {
              const index = this.exercises.findIndex(e => e._id === doc._id)
              if (index === -1) {
                this.exercises.push(doc as Exercise)
              } else {
                this.exercises[index] = doc as Exercise
              }
            }
          }
        })

        this.isInitialized = true
        console.log('Store initialized successfully')
      } catch (error) {
        console.error('Failed to initialize store:', error)
        throw error
      }
    },

    async createGoal(goal: Omit<LearningGoal, '_id' | '_rev'>) {
      try {
        console.log('Creating goal:', goal)
        const doc = await db.post({
          ...goal,
          type: 'learning_goal',
          parentIds: goal.parentIds || []
        })
        console.log('Created goal document:', doc)
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