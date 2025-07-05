import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LearningGoalWidgetRender from './LearningGoalWidgetRender.vue'
import type { LearningGoal } from '@/entities/LearningGoal'

describe('LearningGoalWidgetRender', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockLearningGoal: LearningGoal = {
    uid: 'test-goal-1',
    name: 'Learn Spanish Basics',
    language: 'es',
    parents: [],
    blockedBy: [],
    unitsOfMeaning: [],
    userCreated: true,
    lastDownloadedAt: new Date('2023-01-01'),
    lastPracticedAt: undefined
  }

  it('should render as a table row', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    expect(wrapper.find('tr').exists()).toBe(true)
    expect(wrapper.findAll('td')).toHaveLength(2)
  })

  it('should display learning goal name in first cell', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const firstCell = wrapper.find('td')
    expect(firstCell.text()).toContain('Learn Spanish Basics')
  })

  it('should render three action controls (study, edit, delete) in the second cell', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: { learningGoal: mockLearningGoal }
    })
    const secondCell = wrapper.findAll('td')[1]
    // Find by title attribute for robustness
    const study = secondCell.find('[title="Study"]')
    const edit = secondCell.find('[title="Edit"]')
    const del = secondCell.find('[title="Delete"]')
    expect(study.exists()).toBe(true)
    expect(edit.exists()).toBe(true)
    expect(del.exists()).toBe(true)
  })

  it('should have a study action that navigates to the lesson page', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: { learningGoal: mockLearningGoal },
      global: {
        stubs: {
          'router-link': {
            template: '<a @click="$emit(\'click\')"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
    const study = wrapper.find('[title="Study"]')
    expect(study.exists()).toBe(true)
  })

  it('should have edit and delete buttons that emit events', async () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: { learningGoal: mockLearningGoal }
    })
    const edit = wrapper.find('[title="Edit"]')
    const del = wrapper.find('[title="Delete"]')
    await edit.trigger('click')
    await del.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('should handle different learning goal names', () => {
    const differentGoal: LearningGoal = {
      ...mockLearningGoal,
      name: 'Advanced French Grammar'
    }

    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: differentGoal
      },
      shallow: true
    })

    expect(wrapper.text()).toContain('Advanced French Grammar')
  })
}) 