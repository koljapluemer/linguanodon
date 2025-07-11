import { db } from './dexieDB'
import type { Set } from '@/entities/Set'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'

/**
 * Dexie implementation of SetRepository
 */
export function useRepoDexieSets(): SetRepository {
  return {
    /**
     * Adds a new set to the database
     */
    async addSet(set: Set): Promise<void> {
      try {
        await db.sets.add(set)
      } catch (error) {
        if (error instanceof Error && error.name === 'ConstraintError') {
          throw new Error(`Set with UID ${set.uid} already exists`)
        }
        throw error
      }
    },

    /**
     * Deletes a set by UID
     */
    async deleteSet(uid: string): Promise<void> {
      await db.sets.delete(uid)
    },

    /**
     * Finds a set by UID
     */
    async findSet(uid: string): Promise<Set | null> {
      return await db.sets.get(uid) || null
    },

    /**
     * Gets all sets from the database
     */
    async getAllSets(): Promise<Set[]> {
      return await db.sets.toArray()
    },

    /**
     * Gets all sets for a specific language
     */
    async getSetsByLanguage(language: string): Promise<Set[]> {
      return await db.sets.filter(set => set.language === language).toArray()
    }
  }
}
