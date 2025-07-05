import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RemoteLearningGoalWidgetListRender from './RemoteLearningGoalWidgetListRender.vue'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'

// Mock the child component
vi.mock('./RemoteLearningGoalWidgetController.vue', () => ({
  default: {
    name: 'RemoteLearningGoalWidgetController',
    template: '<div data-testid="widget-controller">Mock Widget Controller</div>',
    props: ['learningGoal']
  }
}))

describe('RemoteLearningGoalWidgetListRender', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should show empty state when no learning goals', () => {
    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: {
        learningGoals: []
      }
    })

    expect(wrapper.text()).toContain('No remote learning goals available for this language.')
  })

  it('should render widget controllers for each learning goal', () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' },
      { uid: 'es_advanced', name: 'Advanced Spanish' },
      { uid: 'es_business', name: 'Business Spanish' }
    ]

    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: {
        learningGoals: mockLearningGoals
      }
    })

    const controllers = wrapper.findAll('[data-testid="widget-controller"]')
    expect(controllers).toHaveLength(3)
  })

  it('should pass learning goal props to controllers', () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' }
    ]

    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: {
        learningGoals: mockLearningGoals
      }
    })

    const controller = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetController' })
    expect(controller.props('learningGoal')).toEqual(mockLearningGoals[0])
  })

  it('should have proper grid layout classes', () => {
    const mockLearningGoals: LearningGoalSummary[] = [
      { uid: 'es_basic', name: 'Basic Spanish' }
    ]

    const wrapper = mount(RemoteLearningGoalWidgetListRender, {
      props: {
        learningGoals: mockLearningGoals
      }
    })

    const grid = wrapper.find('.grid')
    expect(grid.classes()).toContain('gap-4')
    expect(grid.classes()).toContain('md:grid-cols-2')
    expect(grid.classes()).toContain('lg:grid-cols-3')
  })
}) 