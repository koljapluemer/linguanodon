import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import flushPromises from 'flush-promises'
import LearningGoalWidgetListController from './LearningGoalWidgetListController.vue'
import type { LearningGoal } from '@/entities/LearningGoal'

// Mock dependencies
vi.mock('./LearningGoalWidgetListRender.vue', () => ({
  default: {
    name: 'LearningGoalWidgetListRender',
    template: '<div data-testid="list-renderer">Mock List Renderer</div>',
    props: ['learningGoals']
  }
}))

describe('LearningGoalWidgetListController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    const wrapper = mount(LearningGoalWidgetListController, {
      shallow: true
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading learning goals...')
  })

  it('should fetch learning goals on mount and render list', async () => {
    const mockLearningGoals: LearningGoal[] = [
      {
        uid: 'goal-1',
        name: 'Learn Spanish Basics',
        language: 'es',
        parents: [],
        blockedBy: [],
        unitsOfMeaning: [],
        userCreated: true,
        lastDownloadedAt: new Date('2023-01-01'),
        lastPracticedAt: undefined
      }
    ]

    // Mock the store to return learning goals
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.getAllLearningGoals = vi.fn().mockReturnValue(mockLearningGoals)

    mount(LearningGoalWidgetListController, {
      shallow: true
    })

    await flushPromises()
    
    expect(store.getAllLearningGoals).toHaveBeenCalled()
  })

  it('should show error state when fetch fails', async () => {
    // Mock the store to throw an error
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.getAllLearningGoals = vi.fn().mockImplementation(() => {
      throw new Error('Store error')
    })

    const wrapper = mount(LearningGoalWidgetListController, {
      shallow: true
    })

    await flushPromises()
    
    expect(wrapper.find('.alert-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load learning goals')
  })

  it('should pass learning goals to renderer when successful', async () => {
    const mockLearningGoals: LearningGoal[] = [
      {
        uid: 'goal-1',
        name: 'Learn Spanish Basics',
        language: 'es',
        parents: [],
        blockedBy: [],
        unitsOfMeaning: [],
        userCreated: true,
        lastDownloadedAt: new Date('2023-01-01'),
        lastPracticedAt: undefined
      }
    ]

    // Mock the store to return learning goals
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.getAllLearningGoals = vi.fn().mockReturnValue(mockLearningGoals)

    const wrapper = mount(LearningGoalWidgetListController, {
      shallow: true
    })

    await flushPromises()
    
    const renderer = wrapper.findComponent({ name: 'LearningGoalWidgetListRender' })
    expect(renderer.props('learningGoals')).toEqual(mockLearningGoals)
  })

  it('should show toast when error occurs', async () => {
    // Mock the store to throw an error
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.getAllLearningGoals = vi.fn().mockImplementation(() => {
      throw new Error('Store error')
    })

    // Mock the toasts store
    const { useToastsStore } = await import('@/ui/toasts/useToasts')
    const toastsStore = useToastsStore()
    toastsStore.addToast = vi.fn()

    mount(LearningGoalWidgetListController, {
      shallow: true
    })

    await flushPromises()
    
    expect(toastsStore.addToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to load learning goals'
    })
  })

  it('should handle empty learning goals list', async () => {
    // Mock the store to return empty array
    const { useLearningGoalStore } = await import('@/stores/learningGoalStore')
    const store = useLearningGoalStore()
    store.getAllLearningGoals = vi.fn().mockReturnValue([])

    const wrapper = mount(LearningGoalWidgetListController, {
      shallow: true
    })

    await flushPromises()
    
    const renderer = wrapper.findComponent({ name: 'LearningGoalWidgetListRender' })
    expect(renderer.props('learningGoals')).toEqual([])
  })

  it('should have proper loading spinner styling', () => {
    const wrapper = mount(LearningGoalWidgetListController, {
      shallow: true
    })

    const spinner = wrapper.find('.loading')
    expect(spinner.classes()).toContain('loading-spinner')
    expect(spinner.classes()).toContain('loading-lg')
  })
}) 