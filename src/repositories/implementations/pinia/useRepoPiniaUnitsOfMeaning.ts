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
   * Returns all units.
   */
  function getAllUnitsOfMeaning(): UnitOfMeaning[] {
    return unitsOfMeaning.value
  }

  /**
   * Returns all units matching any of the given identifications.
   */
  function getAllUnitsOfMeaningByIdentificationList(identificationList: UnitOfMeaningIdentification[]): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(u => identificationList.some(id => id.language === u.language && id.content === u.content))
  }

  /**
   * Adds a translation to a unit if not already present.
   */
  function addTranslationToUnit(unit: UnitOfMeaning, translation: UnitOfMeaningIdentification) {
    const found = unitsOfMeaning.value.find(u => u.language === unit.language && u.content === unit.content)
    if (found && !found.translations.some(t => t.language === translation.language && t.content === translation.content)) {
      found.translations.push(translation)
    }
  }

  /**
   * Adds a seeAlso reference to a unit if not already present.
   */
  function addSeeAlsoToUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification) {
    const found = unitsOfMeaning.value.find(u => u.language === unit.language && u.content === unit.content)
    if (found && !found.seeAlso.some(s => s.language === seeAlso.language && s.content === seeAlso.content)) {
      found.seeAlso.push(seeAlso)
    }
  }

  /**
   * Removes a seeAlso reference from a unit.
   */
  function removeSeeAlsoFromUnit(unit: UnitOfMeaning, seeAlso: UnitOfMeaningIdentification) {
    const found = unitsOfMeaning.value.find(u => u.language === unit.language && u.content === unit.content)
    if (found) {
      found.seeAlso = found.seeAlso.filter(s => !(s.language === seeAlso.language && s.content === seeAlso.content))
    }
  }

  return {
    addUnitOfMeaning,
    deleteUnitOfMeaning,
    findUnitOfMeaning,
    getAllUnitsOfMeaning,
    getAllUnitsOfMeaningByLanguage,
    getAllUnitsOfMeaningByIdentificationList,
    addTranslationToUnit,
    addSeeAlsoToUnit,
    removeSeeAlsoFromUnit
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
   * Returns all units.
   */
  async getAllUnitsOfMeaning() {
    return Promise.resolve(useUnitOfMeaningStore().getAllUnitsOfMeaning())
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
  },
  /**
   * Adds a translation to a unit if not already present.
   */
  async addTranslationToUnit(unit, translation) {
    const store = useUnitOfMeaningStore()
    const found = store.findUnitOfMeaning(unit.language, unit.content)
    if (found && !found.translations.some(t => t.language === translation.language && t.content === translation.content)) {
      found.translations.push(translation)
    }
    return Promise.resolve()
  },
  /**
   * Adds a seeAlso reference to a unit if not already present.
   */
  async addSeeAlsoToUnit(unit, seeAlso) {
    const store = useUnitOfMeaningStore()
    const found = store.findUnitOfMeaning(unit.language, unit.content)
    if (found && !found.seeAlso.some(s => s.language === seeAlso.language && s.content === seeAlso.content)) {
      found.seeAlso.push(seeAlso)
    }
    return Promise.resolve()
  },
  /**
   * Removes a seeAlso reference from a unit.
   */
  async removeSeeAlsoFromUnit(unit, seeAlso) {
    const store = useUnitOfMeaningStore()
    const found = store.findUnitOfMeaning(unit.language, unit.content)
    if (found) {
      found.seeAlso = found.seeAlso.filter(s => !(s.language === seeAlso.language && s.content === seeAlso.content))
    }
    return Promise.resolve()
  }
}
