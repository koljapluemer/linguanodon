import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RemoteLearningGoalWidgetListRender from './RemoteLearningGoalWidgetListRender.vue'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'

describe('RemoteLearningGoalWidgetListRender', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows empty state when no learning goals', () => {
    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: { learningGoals: [] },
      shallow: true
    })
    expect(wrapper.text()).toContain('No remote learning goals available for this language.')
  })

  it('renders a table', () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' }
    ]
    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renders a stub row for each learning goal', () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' },
      { uid: 'es_advanced', name: 'Advanced Spanish' },
      { uid: 'es_business', name: 'Business Spanish' }
    ]
    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: { learningGoals: mockLearningGoals },
      shallow: true
    })
    // Check that each stub exists
    const stubs = wrapper.findAll('remote-learning-goal-widget-controller-stub')
    expect(stubs).toHaveLength(3)
  })
}) 