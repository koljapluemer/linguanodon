import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

/**
 * Checks if a unit of meaning exists in the given repository by language and content.
 */
export async function doesUnitOfMeaningExist(repo: UnitOfMeaningRepository, language: string, content: string): Promise<boolean> {
  const result = await repo.findUnitOfMeaning(language, content)
  return !!result
}
