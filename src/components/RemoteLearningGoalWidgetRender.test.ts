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

  it('should render learning goal name', () => {
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

    expect(wrapper.find('.card-title').text()).toBe('Basic Greetings')
  })

  it('should extract and display language from UID', () => {
    const mockLearningGoalData: LearningGoalSummary = {
      uid: 'fr_basic_greetings',
      name: 'Basic Greetings'
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: undefined,
        downloading: false
      }
    })

    expect(wrapper.text()).toContain('fr')
    expect(wrapper.find('.badge-outline').text()).toBe('fr')
  })

  it('should show download button when not downloaded', () => {
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

    expect(wrapper.find('.btn-primary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Download')
  })

  it('should show downloaded badge when learning goal exists locally', () => {
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

    expect(wrapper.find('.badge-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Downloaded')
  })

  it('should show downloaded button when learning goal exists locally', () => {
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

    expect(wrapper.find('.btn-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Downloaded')
    expect(wrapper.find('.btn-success').attributes('disabled')).toBeDefined()
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

    expect(wrapper.find('.btn-primary').classes()).toContain('loading')
    expect(wrapper.text()).toContain('Downloading...')
  })

  it('should disable download button when downloading', () => {
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

    expect(wrapper.find('.btn-primary').attributes('disabled')).toBeDefined()
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

  it('should display last downloaded date when available', () => {
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
      lastDownloadedAt: new Date('2023-01-01T10:30:00'),
      lastPracticedAt: undefined
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: mockLocalLearningGoal,
        downloading: false
      }
    })

    expect(wrapper.text()).toContain('Last downloaded:')
    expect(wrapper.text()).toContain('Jan 1, 2023')
  })

  it('should display last practiced date when available', () => {
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
      lastPracticedAt: new Date('2023-01-15T14:20:00')
    }

    const wrapper = mount(RemoteLearningGoalWidgetRender, {
      props: {
        learningGoalData: mockLearningGoalData,
        localLearningGoal: mockLocalLearningGoal,
        downloading: false
      }
    })

    expect(wrapper.text()).toContain('Last practiced:')
    expect(wrapper.text()).toContain('Jan 15, 2023')
  })

  it('should not show practiced date when not available', () => {
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

    expect(wrapper.text()).not.toContain('Last practiced:')
  })

  it('should have proper card styling', () => {
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

    expect(wrapper.find('.card').classes()).toContain('bg-base-100')
    expect(wrapper.find('.card').classes()).toContain('shadow-xl')
    expect(wrapper.find('.card-body').exists()).toBe(true)
  })
}) 