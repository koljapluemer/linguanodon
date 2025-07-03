import { fetchRemoteLearningGoalByUID } from '@/modules/db/db-remote/accessRemoteDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

export async function getRemoteLearningGoalByUID(language: string, uid: string): Promise<{
  learningGoal: LearningGoal,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
}> {
  return fetchRemoteLearningGoalByUID(language, uid)
}

