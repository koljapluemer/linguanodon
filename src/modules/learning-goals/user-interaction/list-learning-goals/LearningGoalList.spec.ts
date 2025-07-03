import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LearningGoalList from './LearningGoalList.vue'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'

describe('LearningGoalList', () => {
  it('renders a list of learning goals', () => {
    const goals: LearningGoal[] = [
      { uid: '1', name: 'Order coffee', parents: [], blockedBy: [], language: 'en', unitsOfMeaning: [], userCreated: true },
      { uid: '2', name: 'Greet people', parents: [], blockedBy: [], language: 'en', unitsOfMeaning: [], userCreated: true }
    ]
    const wrapper = mount(LearningGoalList, { props: { goals } })
    expect(wrapper.text()).toContain('Order coffee')
    expect(wrapper.text()).toContain('Greet people')
    expect(wrapper.findAll('tr')).toHaveLength(2)
  })

  it('renders nothing for an empty list', () => {
    const wrapper = mount(LearningGoalList, { props: { goals: [] } })
    expect(wrapper.findAll('tr')).toHaveLength(0)
  })

  it('renders special characters in goal names', () => {
    const goals: LearningGoal[] = [
      { uid: '3', name: '¡Hola!', parents: [], blockedBy: [], language: 'es', unitsOfMeaning: [], userCreated: true }
    ]
    const wrapper = mount(LearningGoalList, { props: { goals } })
    expect(wrapper.text()).toContain('¡Hola!')
  })
}) 