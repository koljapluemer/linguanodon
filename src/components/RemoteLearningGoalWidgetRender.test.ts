import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RemoteLearningGoalWidgetRender from './RemoteLearningGoalWidgetRender.vue'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import type { LearningGoal } from '@/entities/LearningGoal'

describe('RemoteLearningGoalWidgetRender', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render as a table row', () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: false
      }
    })

    expect(wrapper.find('tr').exists()).toBe(true)
    expect(wrapper.findAll('td')).toHaveLength(2)
  })

  it('should display learning goal name in first cell', () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: false
      }
    })

    const firstCell = wrapper.find('td')
    expect(firstCell.text()).toContain('Basic Greetings')
  })

  it('should show download button in second cell when not downloaded', () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: false
      }
    })

    const secondCell = wrapper.findAll('td')[1]
    expect(secondCell.find('.btn-primary').exists()).toBe(true)
    expect(secondCell.text()).toContain('Download')
  })

  it('should show download status in first cell when downloaded', () => {
    const mockLearningGoalData: LearningGoalSummary = {
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
      lastDownloadedAt: new Date('2023-01-01'),
      lastPracticedAt: undefined
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: mockLocalLearningGoal,
        downloading: false
      }
    })

    const firstCell = wrapper.find('td')
    expect(firstCell.text()).toContain('Last downloaded:')
  })

  it('should show "Downloaded" badge in second cell when downloaded', () => {
    const mockLearningGoalData: LearningGoalSummary = {
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
      lastDownloadedAt: new Date('2023-01-01'),
      lastPracticedAt: undefined
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: mockLocalLearningGoal,
        downloading: false
      }
    })

    const secondCell = wrapper.findAll('td')[1]
    expect(secondCell.find('.badge-success').exists()).toBe(true)
    expect(secondCell.text()).toContain('Downloaded')
  })

  it('should show loading state when downloading', () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: true
      }
    })

    const secondCell = wrapper.findAll('td')[1]
    expect(secondCell.find('.btn-primary').classes()).toContain('loading')
    expect(secondCell.text()).toContain('Downloading...')
  })

  it('should emit download event when download button is clicked', async () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'es_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: false
      }
    })

    const downloadButton = wrapper.find('.btn-primary')
    await downloadButton.trigger('click')

    expect(wrapper.emitted('download')).toBeTruthy()
    expect(wrapper.emitted('download')).toHaveLength(1)
  })
}) 