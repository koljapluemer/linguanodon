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
   * Gets a unit by language and content
   */
  function getUnitByLanguageAndContent(language: string, content: string): UnitOfMeaning | undefined {
    return unitsOfMeaning.value.find(unit => 
      unit.language === language && unit.content === content
    )
  }

  /**
   * Get unit by identification string, meaning something like "en:dog"
   */
  function getUnitByIdentificationString(id: string): UnitOfMeaning | undefined {
    const [language, content] = id.split(':', 2)
    return getUnitByLanguageAndContent(language, content)
  }

  /**
   * Gets multiple units by their language and content pairs
   */
  function getUnitsByLanguageAndContentPairs(pairs: Array<{language: string, content: string}>): UnitOfMeaning[] {
    return unitsOfMeaning.value.filter(unit => 
      pairs.some(pair => unit.language === pair.language && unit.content === pair.content)
    )
  }

  /**
   * Gets translations of a unit by language
   */
  function getTranslationsByLanguage(unit: UnitOfMeaning, language: string): UnitOfMeaning[] {
    const translationUnits: UnitOfMeaning[] = []
    unit.translations.forEach(translationRef => {
      console.debug('[getTranslationsByLanguage] Processing translation ref:', translationRef)
      const translationUnit = getUnitByIdentificationString(translationRef)
      console.debug('[getTranslationsByLanguage] Found unit:', translationUnit)
      if (translationUnit && translationUnit.language === language) {
        translationUnits.push(translationUnit)
      } else {
        console.debug('[getTranslationsByLanguage] Translation not found or wrong language:', {
          requestedRef: translationRef,
          found: !!translationUnit,
          foundLanguage: translationUnit?.language,
          expectedLanguage: language
        })
      }
    })
    return translationUnits
  }

  /**
   * Gets native translations of a unit (English translations)
   */
  function getNativeTranslations(unit: UnitOfMeaning): UnitOfMeaning[] {
    return getTranslationsByLanguage(unit, 'en')
  }

  return {
    unitsOfMeaning,
    addUnit,
    isUnitExists,
    getAllUnits,
    getUnitsByLanguage,
    getUnitByLanguageAndContent,
    getUnitsByLanguageAndContentPairs,
    getTranslationsByLanguage,
    getNativeTranslations,
    getUnitByIdentificationString
  }
}, {
  persist: true
})
