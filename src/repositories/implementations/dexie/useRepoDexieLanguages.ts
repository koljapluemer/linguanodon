import { db, type DexieLanguage } from './dexieDB'
import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'
import { getIsoLanguages } from '@/utils/language/getIsoLanguages'

/**
 * Dexie implementation of LanguageRepository
 */
export function useRepoDexieLanguages(): LanguageRepository {
  // Initialize with ISO languages if database is empty
  initializeWithIsoLanguages()

  return {
    /**
     * Gets all languages from the database
     */
    async getAllLanguages(): Promise<Language[]> {
      const dexieLanguages = await db.languages.toArray()
      return dexieLanguages.map(lang => ({
        code: lang.code,
        name: lang.name,
        custom: lang.isCustom
      }))
    },

    /**
     * Gets user's native languages
     */
    async getUserNativeLanguages(): Promise<Language[]> {
      const nativeLanguages = await db.languages
        .filter(lang => lang.isNative)
        .toArray()
      
      return nativeLanguages.map(lang => ({
        code: lang.code,
        name: lang.name,
        custom: lang.isCustom
      }))
    },

    /**
     * Gets user's target languages
     */
    async getUserTargetLanguages(): Promise<Language[]> {
      const targetLanguages = await db.languages
        .filter(lang => lang.isTarget)
        .toArray()
      
      return targetLanguages.map(lang => ({
        code: lang.code,
        name: lang.name,
        custom: lang.isCustom
      }))
    },

    /**
     * Adds a language to user's native languages
     */
    async addUserNativeLanguage(languageCode: string): Promise<void> {
      const language = await db.languages.get(languageCode)
      if (language) {
        language.isNative = true
        await db.languages.put(language)
      }
    },

    /**
     * Adds a language to user's target languages
     */
    async addUserTargetLanguage(languageCode: string): Promise<void> {
      const language = await db.languages.get(languageCode)
      if (language) {
        language.isTarget = true
        await db.languages.put(language)
      }
    },

    /**
     * Removes a language from user's native languages
     */
    async removeUserNativeLanguage(languageCode: string): Promise<void> {
      const existingLanguage = await db.languages.get(languageCode)
      if (existingLanguage) {
        existingLanguage.isNative = false
        await db.languages.put(existingLanguage)
      }
    },

    /**
     * Removes a language from user's target languages
     */
    async removeUserTargetLanguage(languageCode: string): Promise<void> {
      const existingLanguage = await db.languages.get(languageCode)
      if (existingLanguage) {
        existingLanguage.isTarget = false
        await db.languages.put(existingLanguage)
      }
    }
  }
}

/**
 * Initializes the database with ISO languages if it's empty
 */
async function initializeWithIsoLanguages(): Promise<void> {
  try {
    const languageCount = await db.languages.count()
    
    if (languageCount === 0) {
      const isoLanguages = getIsoLanguages()
      const dexieLanguages: DexieLanguage[] = isoLanguages.map(lang => ({
        ...lang,
        isTarget: false, // Not automatically set as target
        isNative: lang.code === 'eng', // Set English as native language
        isCustom: false
      }))
      
      await db.languages.bulkAdd(dexieLanguages)
      console.log(`Initialized database with ${dexieLanguages.length} ISO languages (English set as native)`)
    }
  } catch (error) {
    console.error('Failed to initialize database with ISO languages:', error)
  }
}
