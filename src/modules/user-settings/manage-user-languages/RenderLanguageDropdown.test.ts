import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RenderLanguageDropdown from './RenderLanguageDropdown.vue'

const mockLanguages = [
  { tag: 'en', name: 'English' },
  { tag: 'fr', name: 'French' },
  { tag: 'de', name: 'German' }
]

describe('RenderLanguageDropdown', () => {
  it('renders only the canonical languages passed as props', () => {
    const wrapper = mount(RenderLanguageDropdown, {
      props: { languages: mockLanguages }
    })
    const options = wrapper.findAll('[data-testid="lang-dropdown"] option')
    // +1 for placeholder
    expect(options).toHaveLength(mockLanguages.length + 1)
    for (let i = 0; i < mockLanguages.length; i++) {
      expect(options[i + 1].text()).toBe(mockLanguages[i].name)
      expect(options[i + 1].attributes('value')).toBe(mockLanguages[i].tag)
    }
  })

  it('emits update:modelValue when a language is selected', async () => {
    const wrapper = mount(RenderLanguageDropdown, {
      props: { languages: mockLanguages }
    })
    const select = wrapper.get('[data-testid="lang-dropdown"]')
    await select.setValue('fr')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['fr'])
  })
}) 