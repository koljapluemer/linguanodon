import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getIsoLanguages } from '@/utils/language/getIsoLanguages'
import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

const useLanguageStore = defineStore('language', () => {
  const languages = ref<Language[]>([])

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

  return {
    getAllLanguages,
    getNativeLanguages,
    getTargetLanguages
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
  }
}
