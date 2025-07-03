import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/modules/db/db-local/accessLocalDB'
import { addLearningGoalWithUnitsAndTranslations, removeLearningGoalWithUnitsAndTranslations, checkExistingItems } from '@/modules/learning-goals/utils/useLearningGoalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

import 'fake-indexeddb/auto'

const goal: LearningGoal = {
  uid: 'goal1',
  name: 'Goal 1',
  parents: [],
  blockedBy: [],
  language: 'en',
  unitsOfMeaning: ['unit1', 'unit2'],
  userCreated: true
}
const unit1: UnitOfMeaning = {
  uid: 'unit1',
  language: 'en',
  content: 'cat',
  linguType: 'noun',
  userCreated: true,
  context: ''
}
const unit2: UnitOfMeaning = {
  uid: 'unit2',
  language: 'en',
  content: 'dog',
  linguType: 'noun',
  userCreated: true,
  context: ''
}
const translation: UnitOfMeaning = {
  uid: 'unit3',
  language: 'de',
  content: 'Katze',
  linguType: 'noun',
  userCreated: true,
  context: ''
}

describe('useLearningGoalDB', () => {
  beforeEach(async () => {
    await db.learningGoals.clear()
    await db.unitsOfMeaning.clear()
  })

  it('adds a new learning goal, units, and translations (happy path)', async () => {
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    const storedGoal = await db.learningGoals.get(goal.uid)
    const storedUnit1 = await db.unitsOfMeaning.get(unit1.uid)
    const storedUnit2 = await db.unitsOfMeaning.get(unit2.uid)
    const storedTranslation = await db.unitsOfMeaning.get(translation.uid)
    expect(storedGoal).toBeTruthy()
    expect(storedUnit1).toBeTruthy()
    expect(storedUnit2).toBeTruthy()
    expect(storedTranslation).toBeTruthy()
  })

  it('deduplicates units and translations by UID', async () => {
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit1, unit2], [translation, translation])
    const allUnits = await db.unitsOfMeaning.toArray()
    const allTranslations = allUnits.filter((u: UnitOfMeaning) => u.uid === translation.uid)
    expect(allUnits.filter((u: UnitOfMeaning) => u.uid === unit1.uid).length).toBe(1)
    expect(allUnits.filter((u: UnitOfMeaning) => u.uid === unit2.uid).length).toBe(1)
    expect(allTranslations.length).toBe(1)
  })

  it('adds only missing units/translations if some already exist', async () => {
    await db.unitsOfMeaning.bulkAdd([unit1])
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    const allUnits = await db.unitsOfMeaning.toArray()
    expect(allUnits.find((u: UnitOfMeaning) => u.uid === unit1.uid)).toBeTruthy()
    expect(allUnits.find((u: UnitOfMeaning) => u.uid === unit2.uid)).toBeTruthy()
    expect(allUnits.find((u: UnitOfMeaning) => u.uid === translation.uid)).toBeTruthy()
  })

  it('does not add a learning goal if goal is null', async () => {
    await addLearningGoalWithUnitsAndTranslations(null, [unit1], [translation])
    const storedGoal = await db.learningGoals.get(goal.uid)
    expect(storedGoal).toBeFalsy()
    expect(await db.unitsOfMeaning.get(unit1.uid)).toBeTruthy()
    expect(await db.unitsOfMeaning.get(translation.uid)).toBeTruthy()
  })

  it('removes a learning goal and related units/translations', async () => {
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    await removeLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    expect(await db.learningGoals.get(goal.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(unit1.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(unit2.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(translation.uid)).toBeFalsy()
  })

  it('removal is safe if items do not exist', async () => {
    await removeLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    expect(await db.learningGoals.get(goal.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(unit1.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(unit2.uid)).toBeFalsy()
    expect(await db.unitsOfMeaning.get(translation.uid)).toBeFalsy()
  })

  it('checkExistingItems reports all missing if DB is empty', async () => {
    const result = await checkExistingItems(goal, [unit1, unit2], [translation])
    expect(result.missingGoal).toEqual(goal)
    expect(result.missingUnits.length).toBe(2)
    expect(result.missingTranslations.length).toBe(1)
    expect(result.existingNames.length).toBe(0)
  })

  it('checkExistingItems reports all present if all exist', async () => {
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    const result = await checkExistingItems(goal, [unit1, unit2], [translation])
    expect(result.missingGoal).toBeNull()
    expect(result.missingUnits.length).toBe(0)
    expect(result.missingTranslations.length).toBe(0)
    expect(result.existingNames).toContain(goal.name)
    expect(result.existingNames).toContain(unit1.content)
    expect(result.existingNames).toContain(unit2.content)
    expect(result.existingNames).toContain(translation.content)
  })

  it('checkExistingItems handles partial presence', async () => {
    await db.unitsOfMeaning.add(unit1)
    const result = await checkExistingItems(goal, [unit1, unit2], [translation])
    expect(result.missingGoal).toEqual(goal)
    expect(result.missingUnits.length).toBe(1)
    expect(result.missingUnits[0].uid).toBe(unit2.uid)
    expect(result.missingTranslations.length).toBe(1)
    expect(result.existingNames).toContain(unit1.content)
  })

  it('checkExistingItems handles empty input arrays', async () => {
    const result = await checkExistingItems(goal, [], [])
    expect(result.missingGoal).toEqual(goal)
    expect(result.missingUnits.length).toBe(0)
    expect(result.missingTranslations.length).toBe(0)
    expect(result.existingNames.length).toBe(0)
  })

  it('add is atomic: duplicate in batch does not partially write', async () => {
    // This should not throw, and only one unit should be present
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit1], [])
    const allUnits = await db.unitsOfMeaning.toArray()
    expect(allUnits.filter((u: UnitOfMeaning) => u.uid === unit1.uid).length).toBe(1)
  })

  it('add, check, remove cycle works as expected', async () => {
    await addLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    let result = await checkExistingItems(goal, [unit1, unit2], [translation])
    expect(result.missingGoal).toBeNull()
    await removeLearningGoalWithUnitsAndTranslations(goal, [unit1, unit2], [translation])
    result = await checkExistingItems(goal, [unit1, unit2], [translation])
    expect(result.missingGoal).toEqual(goal)
  })
}) 