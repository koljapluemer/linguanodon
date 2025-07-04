import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TranslationsWidget from './TranslationsWidget.vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

// Mock the database function
vi.mock('@/modules/unit-of-meaning/utils/useUnitOfMeaningDB', () => ({
  getUnitOfMeaningById: vi.fn()
}))

const mockTranslations: UnitOfMeaning[] = [
  { uid: 't1', content: 'Hallo', language: 'de', linguType: 'word', userCreated: true, context: 'greeting' },
  { uid: 't2', content: 'Hola', language: 'es', linguType: 'word', userCreated: true, context: 'greeting' }
]

const mockParentUnit: UnitOfMeaning = {
  uid: 'parent1',
  language: 'en',
  content: 'Hello',
  linguType: 'word',
  userCreated: true,
  context: '',
  translations: ['t1', 't2']
}

describe('TranslationsWidget.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders one row per translation with correct content and language', async () => {
    const { getUnitOfMeaningById } = await import('@/modules/unit-of-meaning/utils/useUnitOfMeaningDB')
    vi.mocked(getUnitOfMeaningById)
      .mockResolvedValueOnce(mockTranslations[0] as UnitOfMeaning)
      .mockResolvedValueOnce(mockTranslations[1] as UnitOfMeaning)
    
    const wrapper = mount(TranslationsWidget, {
      props: { parentUnit: mockParentUnit }
    })
    
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const rows = wrapper.findAll('tbody tr').filter(row => !row.text().includes('No translations found'))
    expect(rows.length).toBe(2)
    expect(rows[0].text()).toContain('Hallo')
    expect(rows[0].text()).toContain('de')
    expect(rows[1].text()).toContain('Hola')
    expect(rows[1].text()).toContain('es')
  })

  it('renders empty state when translations is empty', async () => {
    const parentUnitWithoutTranslations: UnitOfMeaning = {
      ...mockParentUnit,
      translations: []
    }
    
    const wrapper = mount(TranslationsWidget, {
      props: { parentUnit: parentUnitWithoutTranslations }
    })
    
    await wrapper.vm.$nextTick()
    
    const emptyRow = wrapper.find('tbody tr')
    expect(emptyRow.text()).toContain('No translations found')
  })

  it('renders Remove and Edit buttons for each row, and two add buttons below the table', async () => {
    const { getUnitOfMeaningById } = await import('@/modules/unit-of-meaning/utils/useUnitOfMeaningDB')
    vi.mocked(getUnitOfMeaningById)
      .mockResolvedValueOnce(mockTranslations[0] as UnitOfMeaning)
      .mockResolvedValueOnce(mockTranslations[1] as UnitOfMeaning)
    
    const wrapper = mount(TranslationsWidget, {
      props: { parentUnit: mockParentUnit }
    })
    
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const rows = wrapper.findAll('tbody tr').filter(row => !row.text().includes('No translations found'))
    rows.forEach(row => {
      expect(row.find('button.btn-error').exists()).toBe(true)
      expect(row.find('button.btn-primary').exists()).toBe(true)
    })
    const addButtons = wrapper.findAll('button')
    expect(addButtons[addButtons.length - 2].text()).toContain('Add Existing')
    expect(addButtons[addButtons.length - 1].text()).toContain('Add new')
  })
}) 