import type { SetRepository } from '@/repositories/interfaces/SetRepository'

/**
 * Checks if a set is already downloaded by language and name
 */
export async function isSetDownloaded(
  repository: SetRepository, 
  language: string, 
  name: string
): Promise<boolean> {
  const uid = `${language}_${name}`
  const set = await repository.findSet(uid)
  return !!set
} 