import { describe, it, expect } from 'vitest'
import { useWordForm } from './useWordForm'
import type { WordData } from '@/entities/linguisticUnits'

describe('useWordForm', () => {
  it('should initialize with default values', () => {
    const { form, isValid } = useWordForm()
    
    expect(form.value.type).toBe('word')
    expect(form.value.language).toBe('')
    expect(form.value.content).toBe('')
    expect(isValid.value).toBe(false)
  })

  it('should initialize with provided values', () => {
    const initialWord: Partial<WordData> = {
      language: 'eng',
      content: 'hello',
      notes: [{ content: 'Test note' }]
    }
    
    const { form, isValid } = useWordForm(initialWord)
    
    expect(form.value.language).toBe('eng')
    expect(form.value.content).toBe('hello')
    expect(form.value.notes).toEqual([{ content: 'Test note' }])
    expect(isValid.value).toBe(true)
  })

  it('should validate required fields', () => {
    const { form, validate, errors } = useWordForm()
    
    // Empty form should fail validation
    expect(validate()).toBe(false)
    expect(errors.value.language).toBe('Language is required')
    expect(errors.value.content).toBe('Content is required')
    
    // Fill required fields
    form.value.language = 'eng'
    form.value.content = 'hello'
    
    expect(validate()).toBe(true)
    expect(Object.keys(errors.value)).toHaveLength(0)
  })

  it('should reset form to initial state', () => {
    const initialWord: Partial<WordData> = {
      language: 'eng',
      content: 'hello'
    }
    
    const { form, reset } = useWordForm(initialWord)
    
    // Modify form
    form.value.language = 'spa'
    form.value.content = 'hola'
    
    // Reset
    reset()
    
    expect(form.value.language).toBe('eng')
    expect(form.value.content).toBe('hello')
  })
}) 