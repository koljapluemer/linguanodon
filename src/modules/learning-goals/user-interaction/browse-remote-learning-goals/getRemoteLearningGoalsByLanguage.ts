import { fetchRemoteLearningGoalsByLanguage } from '@/modules/db/db-remote/accessRemoteDB'
import type { LearningGoalSummary } from '@/modules/learning-goals/types/LearningGoalSummary'

/**
 * Stable proxy for remote goal listing, decoupling UI from backend details.
 */
export async function getRemoteLearningGoalsByLanguage(language: string): Promise<LearningGoalSummary[]> {
  return fetchRemoteLearningGoalsByLanguage(language)
}
