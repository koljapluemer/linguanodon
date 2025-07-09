import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

export const useUnitOfMeaningStore = defineStore('unitOfMeaning', () => {
  const unitsOfMeaning = ref<UnitOfMeaning[]>([])

  /**
   * Adds a unit of meaning to the store if it doesn't already exist
   */
  function addUnit(unit: UnitOfMeaning) {
    const exists = isUnitExists(unit.language, unit.content)
    if (!exists) {
      unitsOfMeaning.value.push(unit)
    }
  }

  /**
   * Checks if a unit of meaning already exists by language and content
   */
  function isUnitExists(language: string, content: string): boolean {
    return unitsOfMeaning.value.some(unit => 
      unit.language === language && unit.content === content
    )
  }

  /**
   * Gets all units of meaning
   */
  function getAllUnits(): UnitOfMeaning[] {
    return unitsOfMeaning.value
  }

  /**
   * Gets units by language
   */
  function getUnitsByLanguage(language: string): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(unit => unit.language === language)
  }

  /**
   * Gets a unit by UID
   */
  function getUnitByUid(uid: string): UnitOfMeaning | undefined {
    return unitsOfMeaning.value.find(unit => unit.uid === uid)
  }

  /**
   * Gets multiple units by their UIDs
   */
  function getUnitsByUids(uids: string[]): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(unit => uids.includes(unit.uid))
  }

  return {
    unitsOfMeaning,
    addUnit,
    isUnitExists,
    getAllUnits,
    getUnitsByLanguage,
    getUnitByUid,
    getUnitsByUids
  }
}, {
  persist: true
})
