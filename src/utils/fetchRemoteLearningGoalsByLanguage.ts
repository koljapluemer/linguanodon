import type { LearningGoalSummary } from "@/entities/LearningGoalSummary"

/**
 * All the learning goals for a language, usually called to then download language goals
 */
export async function fetchRemoteLearningGoalsByLanguage(language: string): Promise<LearningGoalSummary[]> {
  const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch remote learning goals for ${language}`)
  return await res.json()
}