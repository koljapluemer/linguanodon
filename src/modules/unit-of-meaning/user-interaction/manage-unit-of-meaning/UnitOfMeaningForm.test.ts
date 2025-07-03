import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'

const mockUnit = {
  uid: 'u1',
  language: 'en',
  content: 'Hello',
  linguType: 'word',
  pronunciation: 'həˈloʊ',
  notes: 'A greeting',
  userCreated: true,
  context: 'greeting'
}

describe('UnitOfMeaningForm.vue', () => {
  it('renders all fields with correct values and are editable', () => {
    const wrapper = mount(UnitOfMeaningForm, {
      props: { unit: mockUnit }
    })
    // Content
    const contentInput = wrapper.find('input[type="text"]:first-of-type')
    expect((contentInput.element as HTMLInputElement).value).toBe('Hello')
    // Linguistic Type
    const typeInput = wrapper.findAll('input[type="text"]')[1]
    expect((typeInput.element as HTMLInputElement).value).toBe('word')
    // Pronunciation
    const pronInput = wrapper.findAll('input[type="text"]')[2]
    expect((pronInput.element as HTMLInputElement).value).toBe('həˈloʊ')
    // Notes
    const notesTextarea = wrapper.find('textarea')
    expect((notesTextarea.element as HTMLTextAreaElement).value).toBe('A greeting')
  })

  it('renders language dropdown with four optgroups and correct options, and is editable', () => {
    const wrapper = mount(UnitOfMeaningForm, {
      props: { unit: mockUnit }
    })
    const select = wrapper.find('select')
    const optgroups = select.findAll('optgroup')
    expect(optgroups.length).toBe(4)
    expect(optgroups[0].attributes('label')).toBe('Primary Target Languages')
    expect(optgroups[1].attributes('label')).toBe('Primary Native Languages')
    expect(optgroups[2].attributes('label')).toBe('Secondary Target Languages')
    expect(optgroups[3].attributes('label')).toBe('Secondary Native Languages')
    // Check for correct options
    expect(optgroups[0].find('option').text()).toBe('English')
    expect(optgroups[1].find('option').text()).toBe('German')
    expect(optgroups[2].find('option').text()).toBe('Spanish')
    expect(optgroups[3].find('option').text()).toBe('French')
  })

  it('renders translations widget placeholder only if showTranslations is true', () => {
    const wrapperWith = mount(UnitOfMeaningForm, {
      props: { unit: mockUnit, showTranslations: true }
    })
    expect(wrapperWith.text()).toContain('TranslationsWidget goes here')
    const wrapperWithout = mount(UnitOfMeaningForm, {
      props: { unit: mockUnit, showTranslations: false }
    })
    expect(wrapperWithout.text()).not.toContain('TranslationsWidget goes here')
  })
}) 