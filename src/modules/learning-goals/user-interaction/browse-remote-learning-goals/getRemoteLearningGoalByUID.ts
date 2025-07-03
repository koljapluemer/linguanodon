import { fetchRemoteLearningGoalByUID, fetchRemoteUnitOfMeaningByUID } from '@/modules/db/db-remote/accessRemoteDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

export async function getRemoteLearningGoalByUID(language: string, uid: string): Promise<{
  learningGoal: LearningGoal,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
}> {
  // The backend returns just the learning goal object
  const learningGoal = await fetchRemoteLearningGoalByUID(language, uid)
  // Fetch all referenced units
  const units = await Promise.all(
    (learningGoal.unitsOfMeaning || []).map(unitUid => fetchRemoteUnitOfMeaningByUID(unitUid))
  )
  // Fetch all direct translations for each unit (flattened, unique by uid)
  const translationUids = Array.from(new Set(units.flatMap(u => u.translations || [])))
  const translations = translationUids.length
    ? await Promise.all(translationUids.map(unitUid => fetchRemoteUnitOfMeaningByUID(unitUid)))
    : []
  return { learningGoal, units, translations }
}

