import { fetchRemoteLearningGoalsByLanguage } from '@/modules/db/db-remote/accessRemoteDB'
import type { LearningGoalSummary } from '@/modules/learning-goals/types/LearningGoalSummary'

export async function getRemoteLearningGoalsByLanguage(language: string): Promise<LearningGoalSummary[]> {
  return fetchRemoteLearningGoalsByLanguage(language)
}
