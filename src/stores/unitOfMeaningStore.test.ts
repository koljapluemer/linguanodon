import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitOfMeaningStore } from './unitOfMeaningStore'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { createEmptyCard } from 'ts-fsrs'

const makeUnit = (overrides: Partial<UnitOfMeaning> = {}): UnitOfMeaning => ({
  uid: 'en_hello',
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
    store.addUnit({ ...unit, uid: 'en_hello2' })
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
    const unit1 = makeUnit({ uid: 'en_1' })
    const unit2 = makeUnit({ uid: 'en_2', content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getAllUnits()).toEqual([unit1, unit2])
  })

  it('getUnitsByLanguage filters by language', () => {
    const unit1 = makeUnit({ uid: 'en_1', language: 'en' })
    const unit2 = makeUnit({ uid: 'ar_1', language: 'ar' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getUnitsByLanguage('en')).toEqual([unit1])
    expect(store.getUnitsByLanguage('ar')).toEqual([unit2])
  })

  it('getUnitByUid returns the correct unit', () => {
    const unit1 = makeUnit({ uid: 'en_1' })
    const unit2 = makeUnit({ uid: 'en_2', content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getUnitByUid('en_2')).toEqual(unit2)
    expect(store.getUnitByUid('not_found')).toBeUndefined()
  })

  it('getUnitsByUids returns multiple units', () => {
    const unit1 = makeUnit({ uid: 'en_1' })
    const unit2 = makeUnit({ uid: 'en_2', content: 'World' })
    store.addUnit(unit1)
    store.addUnit(unit2)
    expect(store.getUnitsByUids(['en_1', 'en_2'])).toEqual([unit1, unit2])
    expect(store.getUnitsByUids(['en_2'])).toEqual([unit2])
  })

  it('getTranslationsByLanguage returns correct translations', () => {
    const enUnit = makeUnit({ uid: 'en_hello', language: 'en', translations: ['ar_hello'] })
    const arUnit = makeUnit({ uid: 'ar_hello', language: 'ar', content: 'مرحبا' })
    store.addUnit(enUnit)
    store.addUnit(arUnit)
    const result = store.getTranslationsByLanguage(enUnit, 'ar')
    expect(result).toEqual([arUnit])
  })

  it('getTranslationsByLanguage returns empty if no translations in that language', () => {
    const enUnit = makeUnit({ uid: 'en_hello', language: 'en', translations: ['ar_hello'] })
    const arUnit = makeUnit({ uid: 'ar_hello', language: 'ar', content: 'مرحبا' })
    store.addUnit(enUnit)
    store.addUnit(arUnit)
    const result = store.getTranslationsByLanguage(enUnit, 'fr')
    expect(result).toEqual([])
  })

  it('getNativeTranslations returns English translations', () => {
    const arUnit = makeUnit({ uid: 'ar_hello', language: 'ar', translations: ['en_hello'] })
    const enUnit = makeUnit({ uid: 'en_hello', language: 'en', content: 'Hello' })
    store.addUnit(arUnit)
    store.addUnit(enUnit)
    const result = store.getNativeTranslations(arUnit)
    expect(result).toEqual([enUnit])
  })

  it('getNativeTranslations returns empty if no English translation', () => {
    const arUnit = makeUnit({ uid: 'ar_hello', language: 'ar', translations: ['fr_hello'] })
    const frUnit = makeUnit({ uid: 'fr_hello', language: 'fr', content: 'Bonjour' })
    store.addUnit(arUnit)
    store.addUnit(frUnit)
    const result = store.getNativeTranslations(arUnit)
    expect(result).toEqual([])
  })
}) 