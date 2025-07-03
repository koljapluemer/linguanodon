import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TranslationsWidget from './TranslationsWidget.vue'

const mockTranslations = [
  { uid: 't1', content: 'Hallo', language: 'de', linguType: 'word', userCreated: true, context: 'greeting' },
  { uid: 't2', content: 'Hola', language: 'es', linguType: 'word', userCreated: true, context: 'greeting' }
]

describe('TranslationsWidget.vue', () => {
  it('renders one row per translation with correct content and language', () => {
    const wrapper = mount(TranslationsWidget, {
      props: { translations: mockTranslations }
    })
    const rows = wrapper.findAll('tbody tr').filter(row => !row.text().includes('No translations found'))
    expect(rows.length).toBe(2)
    expect(rows[0].text()).toContain('Hallo')
    expect(rows[0].text()).toContain('de')
    expect(rows[1].text()).toContain('Hola')
    expect(rows[1].text()).toContain('es')
  })

  it('renders empty state when translations is empty', () => {
    const wrapper = mount(TranslationsWidget, {
      props: { translations: [] }
    })
    const emptyRow = wrapper.find('tbody tr')
    expect(emptyRow.text()).toContain('No translations found')
  })

  it('renders Remove and Edit buttons for each row, and two add buttons below the table', () => {
    const wrapper = mount(TranslationsWidget, {
      props: { translations: mockTranslations }
    })
    const rows = wrapper.findAll('tbody tr').filter(row => !row.text().includes('No translations found'))
    rows.forEach(row => {
      expect(row.find('button.btn-error').exists()).toBe(true)
      expect(row.find('button.btn-primary').exists()).toBe(true)
    })
    const addButtons = wrapper.findAll('button')
    // The last two buttons are the add buttons
    expect(addButtons[addButtons.length - 2].text()).toContain('Add Existing')
    expect(addButtons[addButtons.length - 1].text()).toContain('Add new')
  })
}) 