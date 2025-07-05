import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import flushPromises from 'flush-promises'
import RemoteLearningGoalWidgetListController from './RemoteLearningGoalWidgetListController.vue'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'

// Mock dependencies
vi.mock('@/utils/fetchRemoteLearningGoalsByLanguage')
vi.mock('@/ui/toasts/useToasts', () => ({
  useToastsStore: vi.fn(() => ({
    addToast: vi.fn()
  }))
}))
vi.mock('./RemoteLearningGoalWidgetListRender.vue', () => ({
  default: {
    name: 'RemoteLearningGoalWidgetListRender',
    template: '<div data-testid="list-renderer">Mock List Renderer</div>',
    props: ['learningGoals']
  }
}))

const mockFetchRemoteLearningGoalsByLanguage = vi.mocked(
  await import('@/utils/fetchRemoteLearningGoalsByLanguage')
).fetchRemoteLearningGoalsByLanguage

describe('RemoteLearningGoalWidgetListController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    const wrapper = mount(RemoteLearningGoalWidgetListController, {
      props: {
        language: 'es'
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading remote learning goals...')
  })

  it('should fetch learning goals on mount', async () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' },
      { uid: 'es_advanced', name: 'Advanced Spanish' }
    ]

    mockFetchRemoteLearningGoalsByLanguage.mockResolvedValue(mockLearningGoals)

    const wrapper = mount(RemoteLearningGoalWidgetListController, {
      props: {
        language: 'es'
      }
    })

    expect(mockFetchRemoteLearningGoalsByLanguage).toHaveBeenCalledWith('es')
    
    // Wait for external async operations to complete
    await flushPromises()
    
    expect(wrapper.find('[data-testid="list-renderer"]').exists()).toBe(true)
  })

  it('should show error state when fetch fails', async () => {
    const errorMessage = 'Network error'
    mockFetchRemoteLearningGoalsByLanguage.mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(RemoteLearningGoalWidgetListController, {
      props: {
        language: 'es'
      }
    })

    // Wait for external async operations to complete
    await flushPromises()
    
    expect(wrapper.find('.alert-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load remote learning goals')
    expect(wrapper.text()).toContain(errorMessage)
  })

  it('should pass learning goals to renderer when successful', async () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' }
    ]

    mockFetchRemoteLearningGoalsByLanguage.mockResolvedValue(mockLearningGoals)

    const wrapper = mount(RemoteLearningGoalWidgetListController, {
      props: {
        language: 'es'
      }
    })

    // Wait for external async operations to complete
    await flushPromises()
    
    const renderer = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetListRender' })
    expect(renderer.props('learningGoals')).toEqual(mockLearningGoals)
  })
}) 