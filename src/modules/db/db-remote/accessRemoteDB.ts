/**
* # Remote DB
 * 
 * Users can download learning goals (and their attached units of meaning) from a backend API.
 * 
 * This modul provides utils and definitions to talk to this API.
 * 
 * ---
 * 
 * Currently, the backend API is simply a static site, which directly exposes JSON files.
 * 
 * This may change in the future. The purpose of `accessRemoteDB.ts` is to act as a proxy to this backend, so that the remote API may later change (e.g. to a full-blown REST API) and we only have to change this very file.
 * 
 * ## Implementation Details
 * 
 * ## Testing
 * 
 * - Ensure that a basic connection works
 * - Ensure that all proxy work
 * 
 */

import type { LearningGoalSummary } from '@/modules/learning-goals/types/LearningGoalSummary'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

export async function fetchRemoteLearningGoalsByLanguage(language: string): Promise<LearningGoalSummary[]> {
  const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch remote learning goals for ${language}`)
  return await res.json()
}

export async function fetchRemoteLearningGoalByUID(language: string, uid: string): Promise<LearningGoal> {
  const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${uid}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch remote learning goal ${uid} for ${language}`)
  return await res.json()
}

export async function fetchRemoteUnitOfMeaningByUID(unitUid: string): Promise<UnitOfMeaning> {
  const lang = unitUid.split('_')[0]
  const url = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/${lang}/${unitUid}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch unit ${unitUid} for ${lang}`)
  return await res.json()
}