import { ref } from 'vue'
import { useToast } from '@/modules/ui/toast/useToast'
import { fetchLearningGoalData } from './fetchLearningGoalData'
import { addLearningGoalWithUnitsAndTranslations, removeLearningGoalWithUnitsAndTranslations, checkExistingItems } from '@/modules/learning-goals/utils/useLearningGoalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

/**
 * Composable for orchestrating remote learning goal download and UI state.
 */
export function useRemoteLearningGoalDownloader(language: string) {
  const isDownloading = ref<string | null>(null)
  const { showToast, showUndoToast } = useToast()

  /**
   * Handles the full remote download workflow, including validation and undo.
   */
  async function downloadLearningGoal(uid: string) {
    if (isDownloading.value) return
    isDownloading.value = uid
    let learningGoal: LearningGoal
    let units: UnitOfMeaning[]
    let translations: UnitOfMeaning[]
    let missingGoal: LearningGoal | null
    let missingUnits: UnitOfMeaning[]
    let missingTranslations: UnitOfMeaning[]
    try {
      // Fetch phase (abort on any error)
      const fetchResult = await fetchLearningGoalData(language, uid)
      learningGoal = fetchResult.learningGoal
      units = fetchResult.units
      translations = fetchResult.translations
      // Validate against local DB
      const checkResult = await checkExistingItems(learningGoal, units, translations)
      missingGoal = checkResult.missingGoal
      missingUnits = checkResult.missingUnits
      missingTranslations = checkResult.missingTranslations
      if (!missingGoal && missingUnits.length === 0 && missingTranslations.length === 0) {
        showToast({ type: 'info', message: 'All items already exist locally.', duration: 4000 })
        isDownloading.value = null
        return
      }
      // Atomic write (abort on any error)
      await addLearningGoalWithUnitsAndTranslations(missingGoal || learningGoal, missingUnits, missingTranslations)
      // Toast with undo (undo only removes newly added items)
      showUndoToast('Download successful', async () => {
        await removeLearningGoalWithUnitsAndTranslations(missingGoal || learningGoal, missingUnits, missingTranslations)
        showToast({ type: 'info', message: `Undo: Removed '${learningGoal.name}' and related items.`, duration: 4000 })
      })
    } catch (e) {
      showToast({ type: 'error', message: 'Download failed', duration: 6000 })
      // Log full error for developer
      console.error('Download failed for learning goal', { uid, error: e })
    } finally {
      isDownloading.value = null
    }
  }

  return {
    isDownloading,
    downloadLearningGoal
  }
}
