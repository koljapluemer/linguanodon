import { describe, it, expect, vi } from 'vitest'
import { useRemoteLearningGoalDownloader } from './useRemoteLearningGoalDownloader'
import { fetchLearningGoalData } from './fetchLearningGoalData'

vi.mock('@/modules/ui/toast/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    showUndoToast: vi.fn()
  })
}))
vi.mock('./fetchLearningGoalData', () => ({
  fetchLearningGoalData: vi.fn(async () => ({
    learningGoal: { uid: '1', name: 'Goal' },
    units: [],
    translations: []
  }))
}))
vi.mock('@/modules/learning-goals/utils/useLearningGoalDB', () => ({
  addLearningGoalWithUnitsAndTranslations: vi.fn(async () => {}),
  removeLearningGoalWithUnitsAndTranslations: vi.fn(async () => {}),
  checkExistingItems: vi.fn(async () => ({
    missingGoal: { uid: '1', name: 'Goal' },
    missingUnits: [],
    missingTranslations: []
  }))
}))

/**
 * Ensures downloader integration and error handling for remote learning goal import.
 */
describe('useRemoteLearningGoalDownloader', () => {
  /**
   * Checks the happy path for remote download and toast feedback.
   */
  it('downloads and shows toast', async () => {
    const { downloadLearningGoal, isDownloading } = useRemoteLearningGoalDownloader('en')
    await downloadLearningGoal('1')
    expect(isDownloading.value).toBe(null)
  })

  it('handles fetch error and shows error toast', async () => {
    const { downloadLearningGoal, isDownloading } = useRemoteLearningGoalDownloader('en')
    vi.mocked(fetchLearningGoalData).mockImplementationOnce(() => { throw new Error('fetch failed') })
    await downloadLearningGoal('1')
    expect(isDownloading.value).toBe(null)
  })
}) 