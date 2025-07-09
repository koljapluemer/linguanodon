import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitOfMeaningStore } from './unitOfMeaningStore'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { createEmptyCard } from 'ts-fsrs'

const makeUnit = (overrides: Partial<UnitOfMeaning> = {}): UnitOfMeaning => ({
  language: 'en',
  content: 'Hello',
  notes: '',
  translations: [],
  seeAlso: [],
  credits: [],
  card: createEmptyCard(),
  ...overrides
})

describe('unitOfMeaningStore', () => {
  let store: ReturnType<typeof useUnitOfMeaningStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUnitOfMeaningStore()
    store.unitsOfMeaning = []
  })

  it('adds a unit if it does not exist', () => {
    const unit = makeUnit()
    store.addUnit(unit)
    expect(store.unitsOfMeaning.length).toBe(1)
    expect(store.unitsOfMeaning[0]).toEqual(unit)
  })

  it('does not add duplicate units (by language and content)', () => {
    const unit = makeUnit()
    store.addUnit(unit)
    store.addUnit({ ...unit, notes: 'Different notes' })
    expect(store.unitsOfMeaning.length).toBe(1)
  })

  it('isUnitExists returns true for existing unit', () => {
    const unit = makeUnit()
    store.addUnit(unit)
    expect(store.isUnitExists('en', 'Hello')).toBe(true)
  })

  it('isUnitExists returns false for non-existing unit', () => {
    expect(store.isUnitExists('en', 'World')).toBe(false)
  })

  it('getAllUnits returns all units', () => {
    const unit1 = makeUnit({ content: 'Hello' })
    const unit2 = makeUnit({ content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getAllUnits()).toEqual([unit1, unit2])
  })

  it('getUnitsByLanguage filters by language', () => {
    const unit1 = makeUnit({ language: 'en', content: 'Hello' })
    const unit2 = makeUnit({ language: 'ar', content: 'مرحبا' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getUnitsByLanguage('en')).toEqual([unit1])
    expect(store.getUnitsByLanguage('ar')).toEqual([unit2])
  })

  it('getUnitByLanguageAndContent returns the correct unit', () => {
    const unit1 = makeUnit({ language: 'en', content: 'Hello' })
    const unit2 = makeUnit({ language: 'en', content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getUnitByLanguageAndContent('en', 'World')).toEqual(unit2)
    expect(store.getUnitByLanguageAndContent('en', 'Not found')).toBeUndefined()
  })

  it('getUnitsByLanguageAndContentPairs returns multiple units', () => {
    const unit1 = makeUnit({ language: 'en', content: 'Hello' })
    const unit2 = makeUnit({ language: 'en', content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    const pairs = [
      { language: 'en', content: 'Hello' },
      { language: 'en', content: 'World' }
    ]
    expect(store.getUnitsByLanguageAndContentPairs(pairs)).toEqual([unit1, unit2])
    expect(store.getUnitsByLanguageAndContentPairs([{ language: 'en', content: 'World' }])).toEqual([unit2])
  })

  it('getTranslationsByLanguage returns correct translations', () => {
    const enUnit = makeUnit({ 
      language: 'en', 
      content: 'Hello',
      translations: ['ar:مرحبا']
    })
    const arUnit = makeUnit({ 
      language: 'ar', 
      content: 'مرحبا',
      translations: ['en:Hello']
    })
    store.addUnit(enUnit)
    store.addUnit(arUnit)
    const result = store.getTranslationsByLanguage(enUnit, 'ar')
    expect(result).toEqual([arUnit])
  })

  it('getTranslationsByLanguage returns empty if no translations in that language', () => {
    const enUnit = makeUnit({ 
      language: 'en', 
      content: 'Hello',
      translations: ['ar:مرحبا']
    })
    const arUnit = makeUnit({ 
      language: 'ar', 
      content: 'مرحبا',
      translations: ['en:Hello']
    })
    store.addUnit(enUnit)
    store.addUnit(arUnit)
    const result = store.getTranslationsByLanguage(enUnit, 'fr')
    expect(result).toEqual([])
  })

  it('getNativeTranslations returns English translations', () => {
    const arUnit = makeUnit({ 
      language: 'ar', 
      content: 'مرحبا',
      translations: ['en:Hello']
    })
    const enUnit = makeUnit({ 
      language: 'en', 
      content: 'Hello',
      translations: ['ar:مرحبا']
    })
    store.addUnit(arUnit)
    store.addUnit(enUnit)
    const result = store.getNativeTranslations(arUnit)
    expect(result).toEqual([enUnit])
  })

  it('getNativeTranslations returns empty if no English translation', () => {
    const arUnit = makeUnit({ 
      language: 'ar', 
      content: 'مرحبا',
      translations: ['fr:Bonjour']
    })
    const frUnit = makeUnit({ 
      language: 'fr', 
      content: 'Bonjour',
      translations: ['ar:مرحبا']
    })
    store.addUnit(arUnit)
    store.addUnit(frUnit)
    const result = store.getNativeTranslations(arUnit)
    expect(result).toEqual([])
  })
}) 