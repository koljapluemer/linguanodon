import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RenderLanguageGroup from './RenderLanguageGroup.vue'

const mockLanguages = [
  { tag: 'en', name: 'English' },
  { tag: 'fr', name: 'French' }
]

describe('RenderLanguageGroup', () => {
  it('shows warning banner if primary group is empty', () => {
    const wrapper = mount(RenderLanguageGroup, {
      props: {
        groupName: 'Primary Native Languages',
        languages: [],
        isPrimary: true
      }
    })
    expect(wrapper.find('.alert-warning').exists()).toBe(true)
    expect(wrapper.text()).toContain('Warning:')
    expect(wrapper.text()).toContain('Primary Native Languages')
  })

  it('does not show warning for non-primary group even if empty', () => {
    const wrapper = mount(RenderLanguageGroup, {
      props: {
        groupName: 'Secondary Native Languages',
        languages: [],
        isPrimary: false
      }
    })
    expect(wrapper.find('.alert-warning').exists()).toBe(false)
  })

  it('renders the language list if not empty', () => {
    const wrapper = mount(RenderLanguageGroup, {
      props: {
        groupName: 'Primary Native Languages',
        languages: mockLanguages,
        isPrimary: true
      }
    })
    expect(wrapper.find('.alert-warning').exists()).toBe(false)
    const badges = wrapper.findAll('.badge')
    expect(badges).toHaveLength(mockLanguages.length)
    expect(badges[0].text()).toBe('English')
    expect(badges[1].text()).toBe('French')
  })
}) 