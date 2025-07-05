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

  it('should render three action buttons in second cell', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const secondCell = wrapper.findAll('td')[1]
    const buttons = secondCell.findAll('button')
    expect(buttons).toHaveLength(3)
  })

  it('should have study button with correct styling and icon', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const studyButton = wrapper.find('button[title="Study"]')
    expect(studyButton.exists()).toBe(true)
    expect(studyButton.classes()).toContain('btn-primary')
    expect(studyButton.classes()).toContain('btn-sm')
  })

  it('should have edit button with correct styling and icon', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const editButton = wrapper.find('button[title="Edit"]')
    expect(editButton.exists()).toBe(true)
    expect(editButton.classes()).toContain('btn-secondary')
    expect(editButton.classes()).toContain('btn-sm')
  })

  it('should have delete button with correct styling and icon', () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const deleteButton = wrapper.find('button[title="Delete"]')
    expect(deleteButton.exists()).toBe(true)
    expect(deleteButton.classes()).toContain('btn-error')
    expect(deleteButton.classes()).toContain('btn-sm')
  })

  it('should emit study event when study button is clicked', async () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const studyButton = wrapper.find('button[title="Study"]')
    await studyButton.trigger('click')

    expect(wrapper.emitted('study')).toBeTruthy()
    expect(wrapper.emitted('study')).toHaveLength(1)
  })

  it('should emit edit event when edit button is clicked', async () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const editButton = wrapper.find('button[title="Edit"]')
    await editButton.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('should emit delete event when delete button is clicked', async () => {
    const wrapper = mount(LearningGoalWidgetRender, {
      props: {
        learningGoal: mockLearningGoal
      },
      shallow: true
    })

    const deleteButton = wrapper.find('button[title="Delete"]')
    await deleteButton.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')).toHaveLength(1)
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