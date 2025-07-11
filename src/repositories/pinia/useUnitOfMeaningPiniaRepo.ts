/**
 * Pinia-backed implementation of UnitOfMeaningRepository for in-memory persistence.
 * Allows decoupling components from Pinia by using the repository interface.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UnitOfMeaning, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

const useUnitOfMeaningStore = defineStore('unitOfMeaning', () => {
  const unitsOfMeaning = ref<UnitOfMeaning[]>([])

  /**
   * Adds a unit if it does not already exist (by language and content).
   */
  function addUnitOfMeaning(unit: UnitOfMeaning) {
    if (!unitsOfMeaning.value.some(u => u.language === unit.language && u.content === unit.content)) {
      unitsOfMeaning.value.push(unit)
    }
  }

  /**
   * Removes a unit by language and content.
   */
  function deleteUnitOfMeaning(unit: UnitOfMeaning) {
    const idx = unitsOfMeaning.value.findIndex(u => u.language === unit.language && u.content === unit.content)
    if (idx !== -1) {
      unitsOfMeaning.value.splice(idx, 1)
    }
  }

  /**
   * Finds a unit by language and content, or returns null if not found.
   */
  function findUnitOfMeaning(language: string, content: string): UnitOfMeaning | null {
    return unitsOfMeaning.value.find(u => u.language === language && u.content === content) || null
  }

  /**
   * Returns all units for a given language.
   */
  function getAllUnitsOfMeaningByLanguage(language: string): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(u => u.language === language)
  }

  /**
   * Returns all units matching any of the given identifications.
   */
  function getAllUnitsOfMeaningByIdentificationList(identificationList: UnitOfMeaningIdentification[]): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(u => identificationList.some(id => id.language === u.language && id.content === u.content))
  }

  return {
    addUnitOfMeaning,
    deleteUnitOfMeaning,
    findUnitOfMeaning,
    getAllUnitsOfMeaningByLanguage,
    getAllUnitsOfMeaningByIdentificationList
  }
}, {
  persist: true
})

/**
 * Repository implementation using Pinia store as backend.
 * All methods return Promises for interface compatibility.
 */
export const piniaUnitOfMeaningRepository: UnitOfMeaningRepository = {
  /**
   * Adds a unit if it does not already exist (by language and content).
   */
  async addUnitOfMeaning(unitOfMeaning) {
    useUnitOfMeaningStore().addUnitOfMeaning(unitOfMeaning)
    return Promise.resolve()
  },
  /**
   * Removes a unit by language and content.
   */
  async deleteUnitOfMeaning(unitOfMeaning) {
    useUnitOfMeaningStore().deleteUnitOfMeaning(unitOfMeaning)
    return Promise.resolve()
  },
  /**
   * Finds a unit by language and content, or returns null if not found.
   */
  async findUnitOfMeaning(language, content) {
    return Promise.resolve(useUnitOfMeaningStore().findUnitOfMeaning(language, content))
  },
  /**
   * Returns all units for a given language.
   */
  async getAllUnitsOfMeaningByLanguage(language) {
    return Promise.resolve(useUnitOfMeaningStore().getAllUnitsOfMeaningByLanguage(language))
  },
  /**
   * Returns all units matching any of the given identifications.
   */
  async getAllUnitsOfMeaningByIdentificationList(identificationList) {
    return Promise.resolve(useUnitOfMeaningStore().getAllUnitsOfMeaningByIdentificationList(identificationList))
  }
}
