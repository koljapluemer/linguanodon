import { describe, it, expect } from 'vitest'
import { useSentenceForm } from './useSentenceForm'
import type { SentenceData } from '@/entities/linguisticUnits'

describe('useSentenceForm', () => {
  it('should initialize with default values', () => {
    const { form, isValid } = useSentenceForm()
    
    expect(form.value.type).toBe('sentence')
    expect(form.value.language).toBe('')
    expect(form.value.content).toBe('')
    expect(isValid.value).toBe(false)
  })

  it('should initialize with provided values', () => {
    const initialSentence: Partial<SentenceData> = {
      language: 'eng',
      content: 'Hello world',
      notes: [{ content: 'Test note' }]
    }
    
    const { form, isValid } = useSentenceForm(initialSentence)
    
    expect(form.value.language).toBe('eng')
    expect(form.value.content).toBe('Hello world')
    expect(form.value.notes).toEqual([{ content: 'Test note' }])
    expect(isValid.value).toBe(true)
  })

  it('should validate required fields', () => {
    const { form, validate, errors } = useSentenceForm()
    
    // Empty form should fail validation
    expect(validate()).toBe(false)
    expect(errors.value.language).toBe('Language is required')
    expect(errors.value.content).toBe('Content is required')
    
    // Fill required fields
    form.value.language = 'eng'
    form.value.content = 'Hello world'
    
    expect(validate()).toBe(true)
    expect(Object.keys(errors.value)).toHaveLength(0)
  })

  it('should reset form to initial state', () => {
    const initialSentence: Partial<SentenceData> = {
      language: 'eng',
      content: 'Hello world'
    }
    
    const { form, reset } = useSentenceForm(initialSentence)
    
    // Modify form
    form.value.language = 'spa'
    form.value.content = 'Hola mundo'
    
    // Reset
    reset()
    
    expect(form.value.language).toBe('eng')
    expect(form.value.content).toBe('Hello world')
  })
}) 