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
    }
  }
}
