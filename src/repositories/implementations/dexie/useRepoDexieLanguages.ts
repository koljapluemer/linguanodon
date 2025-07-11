import { db, type DexieLanguage } from './dexieDB'
import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

/**
 * Dexie implementation of LanguageRepository
 */
export function useRepoDexieLanguages(): LanguageRepository {
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
        .filter(lang => !lang.isTarget)
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
    async addUserNativeLanguage(language: Language): Promise<void> {
      const dexieLanguage: DexieLanguage = {
        ...language,
        isTarget: false,
        isCustom: language.custom
      }
      
      await db.languages.put(dexieLanguage)
    },

    /**
     * Adds a language to user's target languages
     */
    async addUserTargetLanguage(language: Language): Promise<void> {
      const dexieLanguage: DexieLanguage = {
        ...language,
        isTarget: true,
        isCustom: language.custom
      }
      
      await db.languages.put(dexieLanguage)
    },

    /**
     * Removes a language from user's native languages
     */
    async removeUserNativeLanguage(language: Language): Promise<void> {
      const existingLanguage = await db.languages.get(language.code)
      if (existingLanguage) {
        existingLanguage.isTarget = true
        await db.languages.put(existingLanguage)
      }
    },

    /**
     * Removes a language from user's target languages
     */
    async removeUserTargetLanguage(language: Language): Promise<void> {
      const existingLanguage = await db.languages.get(language.code)
      if (existingLanguage) {
        existingLanguage.isTarget = false
        await db.languages.put(existingLanguage)
      }
    }
  }
}
