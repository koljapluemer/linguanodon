import { ref } from 'vue'
import { useToast } from '@/modules/ui/toast/useToast'
import { getRemoteLearningGoalByUID } from './getRemoteLearningGoalByUID'
import { addLearningGoalWithUnitsAndTranslations, removeLearningGoalWithUnitsAndTranslations, checkExistingItems } from '@/modules/learning-goals/utils/useLearningGoalDB'

export function useRemoteLearningGoalDownloader(language: string) {
  const isDownloading = ref<string | null>(null)
  const { showToast, showUndoToast } = useToast()

  async function downloadLearningGoal(uid: string) {
    if (isDownloading.value) return
    isDownloading.value = uid
    try {
      // Fetch full learning goal, units, translations
      const { learningGoal, units, translations } = await getRemoteLearningGoalByUID(language, uid)
      // Validate against local DB
      const { missingGoal, missingUnits, missingTranslations, existingNames } = await checkExistingItems(learningGoal, units, translations)
      if (!missingGoal && missingUnits.length === 0 && missingTranslations.length === 0) {
        showToast({ type: 'info', message: 'All items already exist locally.', duration: 4000 })
        isDownloading.value = null
        return
      }
      // Atomic write
      if (missingGoal) {
        await addLearningGoalWithUnitsAndTranslations(missingGoal, missingUnits, missingTranslations)
      } else if (missingUnits.length || missingTranslations.length) {
        // Only add units/translations if goal already exists
        // (should not happen in normal workflow, but for completeness)
        await addLearningGoalWithUnitsAndTranslations(learningGoal, missingUnits, missingTranslations)
      }
      // Toast with undo
      showUndoToast(
        `Downloaded '${learningGoal.name}'. ${existingNames.length ? 'Some items already existed: ' + existingNames.join(', ') : ''}`,
        async () => {
          if (missingGoal) {
            await removeLearningGoalWithUnitsAndTranslations(missingGoal, missingUnits, missingTranslations)
          } else if (missingUnits.length || missingTranslations.length) {
            await removeLearningGoalWithUnitsAndTranslations(learningGoal, missingUnits, missingTranslations)
          }
          showToast({ type: 'info', message: `Undo: Removed '${learningGoal.name}' and related items.`, duration: 4000 })
        }
      )
    } catch (e) {
      showToast({ type: 'error', message: 'Download failed. See console for details.', duration: 6000 })
      if (e instanceof Error) {
        console.error(e)
      }
    } finally {
      isDownloading.value = null
    }
  }

  return {
    isDownloading,
    downloadLearningGoal
  }
}
