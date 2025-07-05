import type { LearningGoalData } from "@/entities/LearningGoalData"

/**
 * Centralizes remote learning goal detail access for future backend flexibility.
 */
export async function fetchRemoteLearningGoalByUID(language: string, uid: string): Promise<LearningGoalData> {
  const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch remote learning goal ${uid} for ${language}`)
  return await res.json()
}