import { describe, it, expect, vi } from 'vitest'
import { useRemoteLearningGoalDownloader } from './useRemoteLearningGoalDownloader'

vi.mock('@/modules/ui/toast/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    showUndoToast: vi.fn()
  })
}))
vi.mock('./getRemoteLearningGoalByUID', () => ({
  getRemoteLearningGoalByUID: vi.fn(async () => ({
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
    missingTranslations: [],
    existingNames: []
  }))
}))

describe('useRemoteLearningGoalDownloader', () => {
  it('downloads and shows toast', async () => {
    const { downloadLearningGoal, isDownloading } = useRemoteLearningGoalDownloader('en')
    await downloadLearningGoal('1')
    expect(isDownloading.value).toBe(null)
  })
}) 