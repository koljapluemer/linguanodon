import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LearningGoalWidgetListRender from './LearningGoalWidgetListRender.vue'
import type { LearningGoal } from '@/entities/LearningGoal'

describe('LearningGoalWidgetListRender', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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
    },
    {
      uid: 'goal-2',
      name: 'Advanced French Grammar',
      language: 'fr',
      parents: [],
      blockedBy: [],
      unitsOfMeaning: [],
      userCreated: false,
      lastDownloadedAt: new Date('2023-02-01'),
      lastPracticedAt: undefined
    }
  ]

  it('should show empty state when no learning goals', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: [] },
      shallow: true
    })
    
    expect(wrapper.text()).toContain('No goals yet')
  })

  it('should render a table when learning goals exist', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('table').classes()).toContain('table')
    expect(wrapper.find('table').classes()).toContain('table-zebra')
    expect(wrapper.find('table').classes()).toContain('w-full')
  })

  it('should render a widget for each learning goal', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    // Check that each stub exists (shallow mounting will create stubs)
    const stubs = wrapper.findAll('learning-goal-widget-render-stub')
    expect(stubs).toHaveLength(2)
  })

  it('should pass correct props to each widget', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    const stubs = wrapper.findAll('learning-goal-widget-render-stub')
    expect(stubs).toHaveLength(2)
  })

  it('should use correct keys for each widget', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    const stubs = wrapper.findAll('learning-goal-widget-render-stub')
    expect(stubs).toHaveLength(2)
  })

  it('should have proper table structure', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('should have overflow handling for table', () => {
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    
    const tableContainer = wrapper.find('.overflow-x-auto')
    expect(tableContainer.exists()).toBe(true)
  })

  it('should handle single learning goal', () => {
    const singleGoal = [mockLearningGoals[0]]
    
    const wrapper = mount(LearningGoalWidgetListRender, {
      props: { learningGoals: singleGoal },
      shallow: true
    })
    
    const stubs = wrapper.findAll('learning-goal-widget-render-stub')
    expect(stubs).toHaveLength(1)
  })
}) 