import { fetchRemoteLearningGoalByUID, fetchRemoteUnitOfMeaningByUID } from '@/modules/db/db-remote/accessRemoteDB'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

/**
 * Fetches a learning goal, its units, and their direct translations from remote, skipping already existing items.
 * Throws on any fetch error. Returns all items to be persisted.
 */
export async function fetchLearningGoalData(language: string, uid: string): Promise<{
  learningGoal: LearningGoal,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
}> {
  // Fetch the learning goal
  let learningGoal: LearningGoal
  try {
    learningGoal = await fetchRemoteLearningGoalByUID(language, uid)
  } catch (e) {
    console.error('Failed to fetch learning goal', e)
    throw new Error('Failed to fetch learning goal')
  }
  // Check which units are already in local DB
  const unitUids = learningGoal.unitsOfMeaning || []
  const localUnits = await db.unitsOfMeaning.bulkGet(unitUids)
  const missingUnitUids = unitUids.filter((uid, i) => !localUnits[i])
  // Fetch missing units
  let units: UnitOfMeaning[] = []
  try {
    units = await Promise.all(missingUnitUids.map(uid => fetchRemoteUnitOfMeaningByUID(uid)))
  } catch (e) {
    console.error('Failed to fetch units of meaning', e)
    throw new Error('Failed to fetch units of meaning')
  }
  // Gather all translation UIDs from fetched units
  const translationUids = Array.from(new Set(units.flatMap(u => u.translations || [])))
  // Check which translations are already in local DB
  const localTranslations = await db.unitsOfMeaning.bulkGet(translationUids)
  const missingTranslationUids = translationUids.filter((uid, i) => !localTranslations[i])
  // Fetch missing translations
  let translations: UnitOfMeaning[] = []
  try {
    translations = await Promise.all(missingTranslationUids.map(uid => fetchRemoteUnitOfMeaningByUID(uid)))
  } catch (e) {
    console.error('Failed to fetch translations', e)
    throw new Error('Failed to fetch translations')
  }
  return { learningGoal, units, translations }
}
