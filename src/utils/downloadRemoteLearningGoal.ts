// pulls multiple utils together to not only download a given learning goal, but also related units of meaning and their (direct) translations (more units of meaning)

import { fetchRemoteLearningGoalByUID } from './fetchRemoteLearningGoalByUID'
import { fetchRemoteUnitOfMeaningByUID } from './fetchRemoteUnitOfMeaningByUID'
import type { LearningGoalData } from '@/entities/LearningGoalData'
import type { UnitOfMeaningData } from '@/entities/UnitOfMeaningData'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { LearningGoal } from '@/entities/LearningGoal'

interface DownloadResult {
  learningGoal: LearningGoalData
  unitsOfMeaning: UnitOfMeaningData[]
}

/**
 * Fetches a learning goal, its units of meaning, and their direct translations.
 * Returns all the data without writing to stores.
 */
export async function fetchRemoteLearningGoalData(language: string, uid: string): Promise<DownloadResult> {
  // 1. Fetch the learning goal data
  const learningGoal = await fetchRemoteLearningGoalByUID(language, uid)
  
  // 2. Fetch all units of meaning for this learning goal
  const unitPromises = learningGoal.unitsOfMeaning.map(unitUid => 
    fetchRemoteUnitOfMeaningByUID(unitUid)
  )
  const unitsOfMeaning = await Promise.all(unitPromises)
  
  // 3. Collect all unique translation UIDs from all units
  const translationUids = new Set<string>()
  unitsOfMeaning.forEach(unit => {
    if (unit.translations) {
      unit.translations.forEach(translationUid => {
        translationUids.add(translationUid)
      })
    }
  })
  
  // 4. Fetch all direct translations
  const translationPromises = Array.from(translationUids).map(translationUid => 
    fetchRemoteUnitOfMeaningByUID(translationUid)
  )
  const translations = await Promise.all(translationPromises)
  
  // 5. Combine all units of meaning (original + translations)
  const allUnitsOfMeaning = [...unitsOfMeaning, ...translations]
  
  return {
    learningGoal,
    unitsOfMeaning: allUnitsOfMeaning
  }
}

/**
 * Downloads a learning goal and adds it to the stores.
 * Skips existing items and handles errors with console logging.
 */
export async function downloadRemoteLearningGoal(language: string, uid: string): Promise<void> {
  try {
    const { learningGoal, unitsOfMeaning } = await fetchRemoteLearningGoalData(language, uid)
    
    // Import stores here to avoid circular dependencies
    const { useUnitOfMeaningStore } = await import('@/stores/unitOfMeaningStore')
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    
    const unitStore = useUnitOfMeaningStore()
    const learningGoalStore = useLearningGoalStore()
    
    // Add all units of meaning in bulk (the store will skip existing ones based on language+content+linguType)
    const unitsToAdd: Omit<UnitOfMeaning, 'uid'>[] = unitsOfMeaning.map(unit => ({
      ...unit,
      lastDownloadedAt: new Date(),
      lastPracticedAt: undefined
    }))
    unitStore.addUnitsOfMeaningBulk(unitsToAdd)
    
    // Add learning goal with original UID (will skip if already exists)
    const learningGoalToAdd: LearningGoal = {
      ...learningGoal,
      lastDownloadedAt: new Date(),
      lastPracticedAt: undefined
    }
    learningGoalStore.createLearningGoalWithUID(learningGoalToAdd)
    
  } catch (error) {
    console.error(`Failed to download learning goal ${uid} for ${language}:`, error)
    throw error
  }
}