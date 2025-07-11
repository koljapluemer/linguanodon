import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Set } from '@/entities/Set'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'

const useSetStore = defineStore('set', () => {
  const sets = ref<Set[]>([])

  /**
   * Adds a set to the store
   */
  function addSet(set: Set) {
    const exists = sets.value.some(s => s.uid === set.uid)
    if (!exists) {
      sets.value.push(set)
    }
  }

  /**
   * Deletes a set by UID
   */
  function deleteSet(uid: string) {
    const index = sets.value.findIndex(set => set.uid === uid)
    if (index !== -1) {
      sets.value.splice(index, 1)
    }
  }

  /**
   * Finds a set by UID
   */
  function findSet(uid: string): Set | null {
    return sets.value.find(set => set.uid === uid) || null
  }

  /**
   * Gets all sets
   */
  function getAllSets(): Set[] {
    return sets.value
  }

  /**
   * Gets sets by language
   */
  function getSetsByLanguage(language: string): Set[] {
    return sets.value.filter(set => set.language === language)
  }

  return {
    addSet,
    deleteSet,
    findSet,
    getAllSets,
    getSetsByLanguage
  }
}, {
  persist: true
})

/**
 * Pinia-backed implementation of SetRepository
 */
export const piniaSetRepository: SetRepository = {
  /**
   * Adds a set to the store
   */
  async addSet(set: Set) {
    useSetStore().addSet(set)
    return Promise.resolve()
  },
  /**
   * Deletes a set by UID
   */
  async deleteSet(uid: string) {
    useSetStore().deleteSet(uid)
    return Promise.resolve()
  },
  /**
   * Finds a set by UID
   */
  async findSet(uid: string) {
    return Promise.resolve(useSetStore().findSet(uid))
  },
  /**
   * Gets all sets
   */
  async getAllSets() {
    return Promise.resolve(useSetStore().getAllSets())
  },
  /**
   * Gets sets by language
   */
  async getSetsByLanguage(language: string) {
    return Promise.resolve(useSetStore().getSetsByLanguage(language))
  }
}
