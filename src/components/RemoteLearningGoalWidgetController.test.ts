import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RemoteLearningGoalWidgetController from './RemoteLearningGoalWidgetController.vue'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import type { LearningGoal } from '@/entities/LearningGoal'

// Mock dependencies
vi.mock('@/utils/downloadRemoteLearningGoal')
vi.mock('./RemoteLearningGoalWidgetRender.vue', () => ({
  default: {
    name: 'RemoteLearningGoalWidgetRender',
    template: '<div data-testid="widget-renderer">Mock Widget Renderer</div>',
    props: ['learningGoalData', 'localLearningGoal', 'downloading'],
    emits: ['download']
  }
}))

const mockDownloadRemoteLearningGoal = vi.mocked(await import('@/utils/downloadRemoteLearningGoal')).downloadRemoteLearningGoal

describe('RemoteLearningGoalWidgetController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render widget renderer with correct props', () => {
    const mockLearningGoal: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetController, {
      props: {
        learningGoal: mockLearningGoal
      }
    })

    const renderer = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetRender' })
    expect(renderer.props('learningGoalData')).toEqual(mockLearningGoal)
    expect(renderer.props('localLearningGoal')).toBeUndefined()
    expect(renderer.props('downloading')).toBe(false)
  })

  it('should pass local learning goal when it exists', async () => {
    const mockLearningGoal: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const mockLocalLearningGoal: LearningGoal = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings',
      language: 'es',
      parents: [],
      blockedBy: [],
      unitsOfMeaning: [],
      userCreated: false,
      lastDownloadedAt: new Date(),
      lastPracticedAt: undefined
    }

    // Mock the store to return the local learning goal
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.createLearningGoalWithUID(mockLocalLearningGoal)

    const wrapper = mount(RemoteLearningGoalWidgetController, {
      props: {
        learningGoal: mockLearningGoal
      }
    })

    const renderer = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetRender' })
    expect(renderer.props('localLearningGoal')).toEqual(mockLocalLearningGoal)
  })

  it('should handle download event from renderer', async () => {
    const mockLearningGoal: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    mockDownloadRemoteLearningGoal.mockResolvedValue()

    const wrapper = mount(RemoteLearningGoalWidgetController, {
      props: {
        learningGoal: mockLearningGoal
      }
    })

    const renderer = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetRender' })
    await renderer.vm.$emit('download')

    expect(mockDownloadRemoteLearningGoal).toHaveBeenCalledWith('es', 'es_basic_greetings')
  })
}) 