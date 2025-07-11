import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

/**
 * Mock implementation of LanguageRepository for testing and development.
 */
export function mockLanguageRepository(): LanguageRepository {
  const mockLanguages: Language[] = [
    { code: 'en', name: 'English', custom: false },
    { code: 'es', name: 'Spanish', custom: false },
    { code: 'fr', name: 'French', custom: false },
    { code: 'de', name: 'German', custom: false },
    { code: 'ar', name: 'Arabic', custom: false },
    { code: 'zh', name: 'Chinese', custom: false },
    { code: 'ja', name: 'Japanese', custom: false },
    { code: 'ko', name: 'Korean', custom: false },
    { code: 'ru', name: 'Russian', custom: false },
    { code: 'pt', name: 'Portuguese', custom: false }
  ]

  // Mock user language lists
  let userNativeLanguages: Language[] = [
    { code: 'en', name: 'English', custom: false }
  ]
  let userTargetLanguages: Language[] = [
    { code: 'es', name: 'Spanish', custom: false },
    { code: 'fr', name: 'French', custom: false }
  ]

  return {
    /**
     * Returns all mock languages.
     */
    async getAllLanguages() {
      return Promise.resolve([...mockLanguages])
    },
    /**
     * Returns native languages (English).
     */
    async getNativeLanguages() {
      return Promise.resolve(mockLanguages.filter(lang => lang.code === 'en'))
    },
    /**
     * Returns target languages (all except English).
     */
    async getTargetLanguages() {
      return Promise.resolve(mockLanguages.filter(lang => lang.code !== 'en'))
    },
    /**
     * Returns user's native languages.
     */
    async getUserNativeLanguages() {
      return Promise.resolve([...userNativeLanguages])
    },
    /**
     * Returns user's target languages.
     */
    async getUserTargetLanguages() {
      return Promise.resolve([...userTargetLanguages])
    },
    /**
     * Adds a language to user's native languages.
     */
    async addUserNativeLanguage(languageCode: string) {
      const language = mockLanguages.find(lang => lang.code === languageCode)
      if (language && !userNativeLanguages.find(lang => lang.code === languageCode)) {
        userNativeLanguages.push(language)
      }
      return Promise.resolve()
    },
    /**
     * Adds a language to user's target languages.
     */
    async addUserTargetLanguage(languageCode: string) {
      const language = mockLanguages.find(lang => lang.code === languageCode)
      if (language && !userTargetLanguages.find(lang => lang.code === languageCode)) {
        userTargetLanguages.push(language)
      }
      return Promise.resolve()
    },
    /**
     * Removes a language from user's native languages.
     */
    async removeUserNativeLanguage(languageCode: string) {
      userNativeLanguages = userNativeLanguages.filter(lang => lang.code !== languageCode)
      return Promise.resolve()
    },
    /**
     * Removes a language from user's target languages.
     */
    async removeUserTargetLanguage(languageCode: string) {
      userTargetLanguages = userTargetLanguages.filter(lang => lang.code !== languageCode)
      return Promise.resolve()
    }
  }
}
