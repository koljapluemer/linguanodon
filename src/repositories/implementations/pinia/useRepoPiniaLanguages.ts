import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getIsoLanguages } from '@/utils/language/getIsoLanguages'
import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

const useLanguageStore = defineStore('language', () => {
  const languages = ref<Language[]>([])
  const userNativeLanguages = ref<Language[]>([])
  const userTargetLanguages = ref<Language[]>([])

  /**
   * Initialize languages from ISO data
   */
  function initializeLanguages() {
    if (languages.value.length === 0) {
      languages.value = getIsoLanguages()
    }
  }

  /**
   * Get all languages
   */
  function getAllLanguages(): Language[] {
    initializeLanguages()
    return languages.value
  }

  /**
   * Get native languages (English for now)
   */
  function getNativeLanguages(): Language[] {
    initializeLanguages()
    return languages.value.filter(lang => lang.code === 'en')
  }

  /**
   * Get target languages (all except English)
   */
  function getTargetLanguages(): Language[] {
    initializeLanguages()
    return languages.value.filter(lang => lang.code !== 'en')
  }

  /**
   * Get user's native languages
   */
  function getUserNativeLanguages(): Language[] {
    return userNativeLanguages.value
  }

  /**
   * Get user's target languages
   */
  function getUserTargetLanguages(): Language[] {
    return userTargetLanguages.value
  }

  /**
   * Add a language to user's native languages
   */
  function addUserNativeLanguage(languageCode: string) {
    const language = languages.value.find(lang => lang.code === languageCode)
    if (language && !userNativeLanguages.value.find(lang => lang.code === languageCode)) {
      userNativeLanguages.value.push(language)
    }
  }

  /**
   * Add a language to user's target languages
   */
  function addUserTargetLanguage(languageCode: string) {
    const language = languages.value.find(lang => lang.code === languageCode)
    if (language && !userTargetLanguages.value.find(lang => lang.code === languageCode)) {
      userTargetLanguages.value.push(language)
    }
  }

  /**
   * Remove a language from user's native languages
   */
  function removeUserNativeLanguage(languageCode: string) {
    userNativeLanguages.value = userNativeLanguages.value.filter(lang => lang.code !== languageCode)
  }

  /**
   * Remove a language from user's target languages
   */
  function removeUserTargetLanguage(languageCode: string) {
    userTargetLanguages.value = userTargetLanguages.value.filter(lang => lang.code !== languageCode)
  }

  return {
    getAllLanguages,
    getNativeLanguages,
    getTargetLanguages,
    getUserNativeLanguages,
    getUserTargetLanguages,
    addUserNativeLanguage,
    addUserTargetLanguage,
    removeUserNativeLanguage,
    removeUserTargetLanguage
  }
}, {
  persist: true
})

/**
 * Pinia-backed implementation of LanguageRepository
 */
export const piniaLanguageRepository: LanguageRepository = {
  /**
   * Returns all available languages from ISO data.
   */
  async getAllLanguages() {
    return Promise.resolve(useLanguageStore().getAllLanguages())
  },
  /**
   * Returns native languages (English for now).
   */
  async getNativeLanguages() {
    return Promise.resolve(useLanguageStore().getNativeLanguages())
  },
  /**
   * Returns target languages (all except English).
   */
  async getTargetLanguages() {
    return Promise.resolve(useLanguageStore().getTargetLanguages())
  },
  /**
   * Returns user's native languages.
   */
  async getUserNativeLanguages() {
    return Promise.resolve(useLanguageStore().getUserNativeLanguages())
  },
  /**
   * Returns user's target languages.
   */
  async getUserTargetLanguages() {
    return Promise.resolve(useLanguageStore().getUserTargetLanguages())
  },
  /**
   * Adds a language to user's native languages.
   */
  async addUserNativeLanguage(languageCode: string) {
    useLanguageStore().addUserNativeLanguage(languageCode)
    return Promise.resolve()
  },
  /**
   * Adds a language to user's target languages.
   */
  async addUserTargetLanguage(languageCode: string) {
    useLanguageStore().addUserTargetLanguage(languageCode)
    return Promise.resolve()
  },
  /**
   * Removes a language from user's native languages.
   */
  async removeUserNativeLanguage(languageCode: string) {
    useLanguageStore().removeUserNativeLanguage(languageCode)
    return Promise.resolve()
  },
  /**
   * Removes a language from user's target languages.
   */
  async removeUserTargetLanguage(languageCode: string) {
    useLanguageStore().removeUserTargetLanguage(languageCode)
    return Promise.resolve()
  }
}
