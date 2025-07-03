import { db } from '@/modules/db/db-local/accessLocalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

function dedupeByUid<T extends { uid: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr.filter(item => {
    if (seen.has(item.uid)) return false
    seen.add(item.uid)
    return true
  })
}

// Stubs for DB logic, to be implemented with Dexie
export async function addLearningGoalWithUnitsAndTranslations(
  goal: LearningGoal | null,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
) {
  const uniqueUnits = dedupeByUid(units)
  const uniqueTranslations = dedupeByUid(translations)
  return db.transaction('rw', db.learningGoals, db.unitsOfMeaning, async () => {
    if (goal) await db.learningGoals.add(goal)
    if (uniqueUnits.length) await db.unitsOfMeaning.bulkAdd(uniqueUnits)
    if (uniqueTranslations.length) await db.unitsOfMeaning.bulkAdd(uniqueTranslations)
  })
}

export async function removeLearningGoalWithUnitsAndTranslations(
  goal: LearningGoal,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
) {
  return db.transaction('rw', db.learningGoals, db.unitsOfMeaning, async () => {
    await db.learningGoals.delete(goal.uid)
    if (units.length) await db.unitsOfMeaning.bulkDelete(units.map(u => u.uid))
    if (translations.length) await db.unitsOfMeaning.bulkDelete(translations.map(t => t.uid))
  })
}

export async function checkExistingItems(
  goal: LearningGoal,
  units: UnitOfMeaning[],
  translations: UnitOfMeaning[]
) {
  // Check if goal exists
  const existingGoal = await db.learningGoals.get(goal.uid)
  // Check which units/translations exist
  const unitUids = units.map(u => u.uid)
  const translationUids = translations.map(t => t.uid)
  const existingUnits = await db.unitsOfMeaning.bulkGet(unitUids)
  const existingTranslations = await db.unitsOfMeaning.bulkGet(translationUids)

  const missingUnits = units.filter((u, i) => !existingUnits[i])
  const missingTranslations = translations.filter((t, i) => !existingTranslations[i])
  const existingNames: string[] = []
  if (existingGoal) existingNames.push(goal.name)
  existingUnits.forEach((u, i) => { if (u) existingNames.push(units[i].content) })
  existingTranslations.forEach((t, i) => { if (t) existingNames.push(translations[i].content) })

  return {
    missingGoal: existingGoal ? null : goal,
    missingUnits,
    missingTranslations,
    existingNames
  }
}
