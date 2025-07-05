import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitOfMeaningStore } from './unitOfMeaningStore'
import type { UnitOfMeaningData } from '@/entities/UnitOfMeaningData'

// Mock crypto.randomUUID to return different UUIDs
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`
})

describe('UnitOfMeaning Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset UUID counter for each test
    uuidCounter = 0
  })

  describe('createUnitOfMeaning', () => {
    it('should create a new unit of meaning with auto-generated UID', () => {
      const store = useUnitOfMeaningStore()
      const unitData: Omit<UnitOfMeaningData, 'uid'> = {
        language: 'en',
        content: 'hello',
        linguType: 'word',
        pronunciation: 'həˈloʊ',
        notes: 'A greeting',
        translations: [],
        related: [],
        userCreated: true,
        author: 'test',
        context: 'greeting',
        license: 'MIT',
        owner: 'test-owner',
        ownerLink: 'https://example.com',
        source: 'test-source',
        sourceLink: 'https://example.com/source'
      }

      const result = store.createUnitOfMeaning(unitData)

      expect(result).toEqual({
        ...unitData,
        uid: 'test-uuid-1'
      })
      expect(store.unitsOfMeaning).toHaveLength(1)
      expect(store.unitsOfMeaning[0]).toEqual(result)
    })

    it('should add multiple units of meaning correctly', () => {
      const store = useUnitOfMeaningStore()
      const unit1: Omit<UnitOfMeaningData, 'uid'> = {
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      }
      const unit2: Omit<UnitOfMeaningData, 'uid'> = {
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      }

      const created1 = store.createUnitOfMeaning(unit1)
      const created2 = store.createUnitOfMeaning(unit2)

      expect(store.unitsOfMeaning).toHaveLength(2)
      expect(store.unitsOfMeaning[0].content).toBe('hello')
      expect(store.unitsOfMeaning[1].content).toBe('hola')
      expect(created1.uid).toBe('test-uuid-1')
      expect(created2.uid).toBe('test-uuid-2')
    })
  })

  describe('getUnitOfMeaning', () => {
    it('should return undefined for non-existent UID', () => {
      const store = useUnitOfMeaningStore()
      const result = store.getUnitOfMeaning('non-existent')
      expect(result).toBeUndefined()
    })

    it('should return the correct unit of meaning by UID', () => {
      const store = useUnitOfMeaningStore()
      const unitData: Omit<UnitOfMeaningData, 'uid'> = {
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      }

      const created = store.createUnitOfMeaning(unitData)
      const result = store.getUnitOfMeaning(created.uid)

      expect(result).toEqual(created)
    })
  })

  describe('getUnitOfMeaningByContent', () => {
    it('should return undefined for non-existent content combination', () => {
      const store = useUnitOfMeaningStore()
      const result = store.getUnitOfMeaningByContent('en', 'hello', 'word')
      expect(result).toBeUndefined()
    })

    it('should return the correct unit of meaning by language + content + linguType', () => {
      const store = useUnitOfMeaningStore()
      const unitData: Omit<UnitOfMeaningData, 'uid'> = {
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      }

      const created = store.createUnitOfMeaning(unitData)
      const result = store.getUnitOfMeaningByContent('en', 'hello', 'word')

      expect(result).toEqual(created)
    })

    it('should return undefined for different language', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.getUnitOfMeaningByContent('es', 'hello', 'word')
      expect(result).toBeUndefined()
    })

    it('should return undefined for different content', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.getUnitOfMeaningByContent('en', 'hi', 'word')
      expect(result).toBeUndefined()
    })

    it('should return undefined for different linguType', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.getUnitOfMeaningByContent('en', 'hello', 'phrase')
      expect(result).toBeUndefined()
    })

    it('should find unit with exact match of all three fields', () => {
      const store = useUnitOfMeaningStore()
      const unit1 = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      
      const unit2 = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'phrase',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result1 = store.getUnitOfMeaningByContent('en', 'hello', 'word')
      const result2 = store.getUnitOfMeaningByContent('en', 'hello', 'phrase')

      expect(result1).toEqual(unit1)
      expect(result2).toEqual(unit2)
    })
  })

  describe('getAllUnitsOfMeaning', () => {
    it('should return empty array when no units exist', () => {
      const store = useUnitOfMeaningStore()
      const result = store.getAllUnitsOfMeaning()
      expect(result).toEqual([])
    })

    it('should return all units of meaning', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.getAllUnitsOfMeaning()

      expect(result).toHaveLength(2)
      expect(result.map(u => u.content)).toEqual(['hello', 'hola'])
      expect(result.map(u => u.language)).toEqual(['en', 'es'])
    })
  })

  describe('getUnitsOfMeaningByLanguage', () => {
    it('should return empty array for non-existent language', () => {
      const store = useUnitOfMeaningStore()
      const result = store.getUnitsOfMeaningByLanguage('non-existent')
      expect(result).toEqual([])
    })

    it('should return units filtered by language', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'en',
        content: 'goodbye',
        linguType: 'word',
        userCreated: true,
        context: 'farewell'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const englishUnits = store.getUnitsOfMeaningByLanguage('en')
      const spanishUnits = store.getUnitsOfMeaningByLanguage('es')

      expect(englishUnits).toHaveLength(2)
      expect(englishUnits.map(u => u.content)).toEqual(['hello', 'goodbye'])
      expect(spanishUnits).toHaveLength(1)
      expect(spanishUnits[0].content).toBe('hola')
    })
  })

  describe('getUnitsOfMeaningByType', () => {
    it('should return empty array for non-existent type', () => {
      const store = useUnitOfMeaningStore()
      const result = store.getUnitsOfMeaningByType('non-existent')
      expect(result).toEqual([])
    })

    it('should return units filtered by linguType', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'en',
        content: 'how are you',
        linguType: 'phrase',
        userCreated: false,
        context: 'question'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const wordUnits = store.getUnitsOfMeaningByType('word')
      const phraseUnits = store.getUnitsOfMeaningByType('phrase')

      expect(wordUnits).toHaveLength(2)
      expect(wordUnits.map(u => u.content)).toEqual(['hello', 'hola'])
      expect(phraseUnits).toHaveLength(1)
      expect(phraseUnits[0].content).toBe('how are you')
    })
  })

  describe('getUnitsOfMeaningByUserCreated', () => {
    it('should return units filtered by userCreated flag', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'en',
        content: 'the',
        linguType: 'word',
        userCreated: false,
        context: 'article'
      } as Omit<UnitOfMeaningData, 'uid'>)
      store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const userCreatedUnits = store.getUnitsOfMeaningByUserCreated(true)
      const systemUnits = store.getUnitsOfMeaningByUserCreated(false)

      expect(userCreatedUnits).toHaveLength(2)
      expect(userCreatedUnits.map(u => u.content)).toEqual(['hello', 'hola'])
      expect(systemUnits).toHaveLength(1)
      expect(systemUnits[0].content).toBe('the')
    })
  })

  describe('addUnitsOfMeaningBulk', () => {
    it('should add multiple units with auto-generated UIDs', () => {
      const store = useUnitOfMeaningStore()
      const unitsData: Omit<UnitOfMeaningData, 'uid'>[] = [
        {
          language: 'en',
          content: 'hello',
          linguType: 'word',
          userCreated: true,
          context: 'greeting'
        },
        {
          language: 'es',
          content: 'hola',
          linguType: 'word',
          userCreated: false,
          context: 'greeting'
        },
        {
          language: 'fr',
          content: 'bonjour',
          linguType: 'word',
          userCreated: true,
          context: 'greeting'
        }
      ]

      const result = store.addUnitsOfMeaningBulk(unitsData)

      expect(result).toHaveLength(3)
      expect(store.getUnitOfMeaningByContent('en', 'hello', 'word')).toBeDefined()
      expect(store.getUnitOfMeaningByContent('es', 'hola', 'word')).toBeDefined()
      expect(store.getUnitOfMeaningByContent('fr', 'bonjour', 'word')).toBeDefined()
      expect(store.unitsOfMeaning).toHaveLength(3)
    })

    it('should handle empty bulk array', () => {
      const store = useUnitOfMeaningStore()
      const result = store.addUnitsOfMeaningBulk([])
      expect(result).toHaveLength(0)
      expect(store.unitsOfMeaning).toHaveLength(0)
    })

    it('should skip existing units based on language + content + linguType', () => {
      const store = useUnitOfMeaningStore()
      store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const unitsData: Omit<UnitOfMeaningData, 'uid'>[] = [
        {
          language: 'en',
          content: 'hello',
          linguType: 'word',
          userCreated: false,
          context: 'greeting'
        },
        {
          language: 'es',
          content: 'hola',
          linguType: 'word',
          userCreated: false,
          context: 'greeting'
        },
        {
          language: 'en',
          content: 'hello',
          linguType: 'phrase',
          userCreated: false,
          context: 'greeting'
        }
      ]

      const result = store.addUnitsOfMeaningBulk(unitsData)

      expect(result).toHaveLength(2)
      expect(store.unitsOfMeaning).toHaveLength(3)
      const existingUnit = store.getUnitOfMeaningByContent('en', 'hello', 'word')
      expect(existingUnit).toBeDefined()
      expect(existingUnit?.userCreated).toBe(true)
    })

    it('should handle multiple duplicates in the same bulk operation', () => {
      const store = useUnitOfMeaningStore()
      const unitsData: Omit<UnitOfMeaningData, 'uid'>[] = [
        {
          language: 'en',
          content: 'hello',
          linguType: 'word',
          userCreated: true,
          context: 'greeting'
        },
        {
          language: 'en',
          content: 'hello',
          linguType: 'word',
          userCreated: false,
          context: 'greeting'
        },
        {
          language: 'es',
          content: 'hola',
          linguType: 'word',
          userCreated: false,
          context: 'greeting'
        },
        {
          language: 'es',
          content: 'hola',
          linguType: 'word',
          userCreated: true,
          context: 'greeting'
        }
      ]

      const result = store.addUnitsOfMeaningBulk(unitsData)

      expect(result).toHaveLength(2)
      expect(store.unitsOfMeaning).toHaveLength(2)
      expect(store.getUnitOfMeaningByContent('en', 'hello', 'word')).toBeDefined()
      expect(store.getUnitOfMeaningByContent('es', 'hola', 'word')).toBeDefined()
    })
  })

  describe('updateUnitOfMeaning', () => {
    it('should throw error for non-existent UID', () => {
      const store = useUnitOfMeaningStore()
      expect(() => {
        store.updateUnitOfMeaning('non-existent', { content: 'Updated' })
      }).toThrow('Unit of meaning not found')
    })

    it('should update existing unit of meaning', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.updateUnitOfMeaning(unit.uid, {
        content: 'hi',
        pronunciation: 'haɪ'
      })

      expect(result.content).toBe('hi')
      expect(result.pronunciation).toBe('haɪ')
      expect(result.language).toBe('en')
      expect(result.userCreated).toBe(true)
      expect(store.unitsOfMeaning[0]).toEqual(result)
    })

    it('should update multiple fields at once', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.updateUnitOfMeaning(unit.uid, {
        content: 'hi',
        language: 'en-US',
        linguType: 'interjection',
        pronunciation: 'haɪ',
        notes: 'Informal greeting',
        translations: ['translation-1'],
        related: ['related-1']
      })

      expect(result.content).toBe('hi')
      expect(result.language).toBe('en-US')
      expect(result.linguType).toBe('interjection')
      expect(result.pronunciation).toBe('haɪ')
      expect(result.notes).toBe('Informal greeting')
      expect(result.translations).toEqual(['translation-1'])
      expect(result.related).toEqual(['related-1'])
    })
  })

  describe('deleteUnitOfMeaning', () => {
    it('should throw error for non-existent UID', () => {
      const store = useUnitOfMeaningStore()
      expect(() => {
        store.deleteUnitOfMeaning('non-existent')
      }).toThrow('Unit of meaning not found')
    })

    it('should delete existing unit of meaning', () => {
      const store = useUnitOfMeaningStore()
      const unit1 = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const unit2 = store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      expect(store.unitsOfMeaning).toHaveLength(2)

      store.deleteUnitOfMeaning(unit1.uid)

      expect(store.unitsOfMeaning).toHaveLength(1)
      expect(store.unitsOfMeaning[0]).toEqual(unit2)
      expect(store.getUnitOfMeaning(unit1.uid)).toBeUndefined()
    })

    it('should handle deleting the last unit', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      store.deleteUnitOfMeaning(unit.uid)

      expect(store.unitsOfMeaning).toHaveLength(0)
      expect(store.getAllUnitsOfMeaning()).toEqual([])
    })
  })

  describe('translation management', () => {
    it('should get translations for a unit', () => {
      const store = useUnitOfMeaningStore()
      const unit1 = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation1 = store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation2 = store.createUnitOfMeaning({
        language: 'fr',
        content: 'bonjour',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      store.updateUnitOfMeaning(unit1.uid, {
        translations: [translation1.uid, translation2.uid]
      })

      const translations = store.getTranslations(unit1.uid)

      expect(translations).toHaveLength(2)
      expect(translations.map(t => t.content)).toEqual(['hola', 'bonjour'])
      expect(translations.map(t => t.language)).toEqual(['es', 'fr'])
    })

    it('should return empty array for unit without translations', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const translations = store.getTranslations(unit.uid)

      expect(translations).toEqual([])
    })

    it('should add translation to a unit', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation = store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      store.addTranslation(unit.uid, translation.uid)

      const updatedUnit = store.getUnitOfMeaning(unit.uid)
      expect(updatedUnit?.translations).toContain(translation.uid)
    })

    it('should not add duplicate translation', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation = store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      store.addTranslation(unit.uid, translation.uid)
      store.addTranslation(unit.uid, translation.uid)

      const updatedUnit = store.getUnitOfMeaning(unit.uid)
      expect(updatedUnit?.translations).toEqual([translation.uid])
    })

    it('should remove translation from a unit', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation1 = store.createUnitOfMeaning({
        language: 'es',
        content: 'hola',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)
      const translation2 = store.createUnitOfMeaning({
        language: 'fr',
        content: 'bonjour',
        linguType: 'word',
        userCreated: false,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      store.updateUnitOfMeaning(unit.uid, {
        translations: [translation1.uid, translation2.uid]
      })

      store.removeTranslation(unit.uid, translation1.uid)

      const updatedUnit = store.getUnitOfMeaning(unit.uid)
      expect(updatedUnit?.translations).toEqual([translation2.uid])
    })

    it('should throw error when removing translation from non-existent unit', () => {
      const store = useUnitOfMeaningStore()
      expect(() => {
        store.removeTranslation('non-existent', 'translation-uid')
      }).toThrow('Unit of meaning or translations not found')
    })
  })

  describe('edge cases', () => {
    it('should handle empty updates', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      const result = store.updateUnitOfMeaning(unit.uid, {})

      expect(result).toEqual(unit)
    })

    it('should handle units with all optional fields', () => {
      const store = useUnitOfMeaningStore()
      const unit = store.createUnitOfMeaning({
        language: 'en',
        content: 'hello',
        linguType: 'word',
        userCreated: true,
        context: 'greeting'
      } as Omit<UnitOfMeaningData, 'uid'>)

      expect(unit.pronunciation).toBeUndefined()
      expect(unit.notes).toBeUndefined()
      expect(unit.translations).toBeUndefined()
      expect(unit.related).toBeUndefined()
      expect(unit.author).toBeUndefined()
      expect(unit.license).toBeUndefined()
      expect(unit.owner).toBeUndefined()
      expect(unit.ownerLink).toBeUndefined()
      expect(unit.source).toBeUndefined()
      expect(unit.sourceLink).toBeUndefined()
    })
  })
}) 