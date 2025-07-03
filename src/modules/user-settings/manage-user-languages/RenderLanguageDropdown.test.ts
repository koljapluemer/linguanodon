import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import RenderLanguageDropdown from './RenderLanguageDropdown.vue'
import * as languagesDB from '@/modules/languages/utils/useLanguagesDB'

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

  it('renders canonical languages from useCanonicalLanguageList (mocked)', async () => {
    vi.spyOn(languagesDB, 'useCanonicalLanguageList').mockReturnValue({
      languages: ref(mockLanguages),
      refresh: vi.fn()
    })
    const { useCanonicalLanguageList } = languagesDB
    const { languages } = useCanonicalLanguageList()
    const wrapper = mount(RenderLanguageDropdown, {
      props: { languages: languages.value }
    })
    const options = wrapper.findAll('[data-testid="lang-dropdown"] option')
    // +1 for placeholder
    expect(options.length).toBeGreaterThan(1)
    // Check that all canonical languages are present
    for (const lang of languages.value) {
      const option = wrapper.find(`[data-testid="lang-option-${lang.tag}"]`)
      expect(option.exists()).toBe(true)
      expect(option.text()).toBe(lang.name)
      expect(option.attributes('value')).toBe(lang.tag)
    }
  })
}) 