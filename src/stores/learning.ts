import { defineStore } from 'pinia'
import PouchDB from 'pouchdb/dist/pouchdb'
import type { LearningGoal, SubGoal, UnitOfMeaning, Exercise } from '@/types/learning'
import { useExerciseGenerator } from '@/composables/useExerciseGenerator'

// Create database instance
const db = new PouchDB('linguanodon-learning')
const exerciseGenerator = useExerciseGenerator()

export const useLearningStore = defineStore('learning', {
  state: () => ({
    currentGoal: null as LearningGoal | null,
    currentSubGoal: null as SubGoal | null,
    goals: [] as LearningGoal[],
    subGoals: [] as SubGoal[],
    unitsOfMeaning: [] as UnitOfMeaning[],
    exercises: [] as Exercise[]
  }),

  actions: {
    async init() {
      try {
        // Use allDocs instead of find for initial queries
        const goals = await db.allDocs({
          include_docs: true,
          startkey: 'learning_goal',
          endkey: 'learning_goal\ufff0'
        })
        this.goals = goals.rows.map((row: { doc: LearningGoal }) => row.doc)

        const subGoals = await db.allDocs({
          include_docs: true,
          startkey: 'sub_goal',
          endkey: 'sub_goal\ufff0'
        })
        this.subGoals = subGoals.rows.map((row: { doc: SubGoal }) => row.doc)

        const units = await db.allDocs({
          include_docs: true,
          startkey: 'unit_of_meaning',
          endkey: 'unit_of_meaning\ufff0'
        })
        this.unitsOfMeaning = units.rows.map((row: { doc: UnitOfMeaning }) => row.doc)

        const exercises = await db.allDocs({
          include_docs: true,
          startkey: 'exercise',
          endkey: 'exercise\ufff0'
        })
        this.exercises = exercises.rows.map((row: { doc: Exercise }) => row.doc)
      } catch (error) {
        console.error('Failed to initialize store:', error)
      }
    },

    async createGoal(goal: Omit<LearningGoal, '_id' | '_rev'>) {
      try {
        const doc = await db.post({
          ...goal,
          type: 'learning_goal'
        })
        const newGoal = { ...goal, _id: doc.id, _rev: doc.rev } as LearningGoal
        this.goals.push(newGoal)
        return newGoal
      } catch (error) {
        console.error('Failed to create goal:', error)
        throw error
      }
    },

    async createSubGoal(subGoal: Omit<SubGoal, '_id' | '_rev'>) {
      try {
        const doc = await db.post({
          ...subGoal,
          type: 'sub_goal'
        })
        const newSubGoal = { ...subGoal, _id: doc.id, _rev: doc.rev } as SubGoal
        this.subGoals.push(newSubGoal)
        return newSubGoal
      } catch (error) {
        console.error('Failed to create subgoal:', error)
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
        if (!exercise) throw new Error('Exercise not found')
        
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
        if (!unit) throw new Error('Unit of meaning not found')
        
        // Delete all associated exercises first
        const exercises = this.getExercisesForUnit(unitId)
        for (const exercise of exercises) {
          await this.deleteExercise(exercise._id!)
        }
        
        await db.remove(unit)
        this.unitsOfMeaning = this.unitsOfMeaning.filter(u => u._id !== unitId)
      } catch (error) {
        console.error('Failed to delete unit of meaning:', error)
        throw error
      }
    },

    async deleteSubGoal(subGoalId: string) {
      try {
        const subGoal = this.subGoals.find(sg => sg._id === subGoalId)
        if (!subGoal) throw new Error('Subgoal not found')
        
        // Delete all associated units and their exercises
        const units = this.unitsOfMeaning.filter(u => u.subGoalId === subGoalId)
        for (const unit of units) {
          await this.deleteUnitOfMeaning(unit._id!)
        }
        
        await db.remove(subGoal)
        this.subGoals = this.subGoals.filter(sg => sg._id !== subGoalId)
      } catch (error) {
        console.error('Failed to delete subgoal:', error)
        throw error
      }
    },

    async deleteGoal(goalId: string) {
      try {
        const goal = this.goals.find(g => g._id === goalId)
        if (!goal) throw new Error('Goal not found')
        
        // Delete all associated subgoals, units, and exercises
        const subGoals = this.subGoals.filter(sg => sg.parentId === goalId)
        for (const subGoal of subGoals) {
          await this.deleteSubGoal(subGoal._id!)
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
        if (!exercise) throw new Error('Exercise not found')
        
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

    getExercisesForSubGoal(subGoalId: string) {
      const units = this.unitsOfMeaning.filter(u => u.subGoalId === subGoalId)
      return this.exercises.filter(e => 
        units.some(u => u._id === e.unitId)
      )
    }
  }
}) 