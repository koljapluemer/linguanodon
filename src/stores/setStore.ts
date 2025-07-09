import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Set } from '@/entities/Set'

export const useSetStore = defineStore('set', () => {
  const sets = ref<Set[]>([])

  /**
   * Adds a downloaded set to the store
   */
  function addDownloadedSet(set: Set) {
    const exists = isSetDownloaded(set.language, set.uid)
    if (!exists) {
      sets.value.push(set)
    }
  }

  /**
   * Checks if a set is already downloaded by language and name
   */
  function isSetDownloaded(language: string, name: string): boolean {
    return sets.value.some(set => 
      set.language === language && set.uid === `${language}_${name}`
    )
  }

  /**
   * Gets all downloaded sets
   */
  function getDownloadedSets(): Set[] {
    return sets.value
  }

  /**
   * Gets sets by language
   */
  function getSetsByLanguage(language: string): Set[] {
    return sets.value.filter(set => set.language === language)
  }

  /**
   * Gets a set by UID
   */
  function getSetByUid(uid: string): Set | undefined {
    return sets.value.find(set => set.uid === uid)
  }

  return {
    sets,
    getAllSets: sets,
    addDownloadedSet,
    isSetDownloaded,
    getDownloadedSets,
    getSetsByLanguage,
    getSetByUid
  }
}, {
  persist: true
})
