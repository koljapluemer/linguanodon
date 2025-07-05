import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ViewRemoteLearningGoals from './ViewRemoteLearningGoals.vue'

// Mock the child component
vi.mock('@/components/RemoteLearningGoalWidgetListController.vue', () => ({
  default: {
    name: 'RemoteLearningGoalWidgetListController',
    template: '<div data-testid="list-controller">Mock List Controller</div>',
    props: ['language']
  }
}))

describe('ViewRemoteLearningGoals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render the page title with language code', () => {
    const wrapper = mount(ViewRemoteLearningGoals, {
      props: {
        lang_code: 'es'
      }
    })

    expect(wrapper.text()).toContain('Remote Learning Goals for es')
    expect(wrapper.find('h1').text()).toBe('Remote Learning Goals for es')
  })

  it('should pass language prop to the list controller', () => {
    const wrapper = mount(ViewRemoteLearningGoals, {
      props: {
        lang_code: 'fr'
      }
    })

    const listController = wrapper.findComponent({ name: 'RemoteLearningGoalWidgetListController' })
    expect(listController.props('language')).toBe('fr')
  })

  it('should render the list controller component', () => {
    const wrapper = mount(ViewRemoteLearningGoals, {
      props: {
        lang_code: 'en'
      }
    })

    expect(wrapper.find('[data-testid="list-controller"]').exists()).toBe(true)
  })

  it('should have proper styling classes', () => {
    const wrapper = mount(ViewRemoteLearningGoals, {
      props: {
        lang_code: 'de'
      }
    })

    expect(wrapper.find('.p-4').exists()).toBe(true)
    expect(wrapper.find('h1').classes()).toContain('text-2xl')
    expect(wrapper.find('h1').classes()).toContain('font-bold')
    expect(wrapper.find('h1').classes()).toContain('mb-4')
  })
}) 