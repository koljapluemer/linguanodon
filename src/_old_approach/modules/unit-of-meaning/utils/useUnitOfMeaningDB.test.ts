import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as dbModule from '@/modules/db/db-local/accessLocalDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'
import {
  getAllUnitsOfMeaning,
  getUnitOfMeaningById,
  addUnitOfMeaning,
  updateUnitOfMeaning,
  removeUnitOfMeaning,
  addTranslation,
  removeTranslation
} from './useUnitOfMeaningDB'

const mockDb = {
  unitsOfMeaning: {
    toArray: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    update: vi.fn()
  }
}

const sampleUnit: UnitOfMeaning = {
  uid: 'u1',
  language: 'en',
  content: 'Hello',
  linguType: 'word',
  userCreated: true,
  context: 'greeting',
  translations: ['u2']
}

beforeEach(() => {
  vi.spyOn(dbModule, 'db', 'get').mockReturnValue(mockDb as unknown as typeof dbModule.db)
  Object.values(mockDb.unitsOfMeaning).forEach(fn => fn.mockReset())
})

describe('useUnitOfMeaningDB', () => {
  it('getAllUnitsOfMeaning returns all units', async () => {
    mockDb.unitsOfMeaning.toArray.mockResolvedValue([sampleUnit])
    const result = await getAllUnitsOfMeaning()
    expect(result).toEqual([sampleUnit])
    expect(mockDb.unitsOfMeaning.toArray).toHaveBeenCalled()
  })

  it('getUnitOfMeaningById returns the unit if found', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue(sampleUnit)
    const result = await getUnitOfMeaningById('u1')
    expect(result).toEqual(sampleUnit)
    expect(mockDb.unitsOfMeaning.get).toHaveBeenCalledWith('u1')
  })

  it('getUnitOfMeaningById returns undefined if not found', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue(undefined)
    const result = await getUnitOfMeaningById('notfound')
    expect(result).toBeUndefined()
  })

  it('addUnitOfMeaning puts the unit and returns its uid', async () => {
    mockDb.unitsOfMeaning.put.mockResolvedValue(undefined)
    const result = await addUnitOfMeaning(sampleUnit)
    expect(result).toBe('u1')
    expect(mockDb.unitsOfMeaning.put).toHaveBeenCalledWith(sampleUnit)
  })

  it('updateUnitOfMeaning puts the unit', async () => {
    mockDb.unitsOfMeaning.put.mockResolvedValue(undefined)
    await updateUnitOfMeaning(sampleUnit)
    expect(mockDb.unitsOfMeaning.put).toHaveBeenCalledWith(sampleUnit)
  })

  it('removeUnitOfMeaning deletes the unit by uid', async () => {
    mockDb.unitsOfMeaning.delete.mockResolvedValue(undefined)
    await removeUnitOfMeaning('u1')
    expect(mockDb.unitsOfMeaning.delete).toHaveBeenCalledWith('u1')
  })

  it('addTranslation adds translation if not present', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue({ ...sampleUnit, translations: [] })
    mockDb.unitsOfMeaning.update.mockResolvedValue(undefined)
    await addTranslation('u1', 'u2')
    expect(mockDb.unitsOfMeaning.update).toHaveBeenCalledWith('u1', { translations: ['u2'] })
  })

  it('addTranslation does not add duplicate translation', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue({ ...sampleUnit, translations: ['u2'] })
    await addTranslation('u1', 'u2')
    expect(mockDb.unitsOfMeaning.update).not.toHaveBeenCalled()
  })

  it('addTranslation does nothing if parent not found', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue(undefined)
    await addTranslation('notfound', 'u2')
    expect(mockDb.unitsOfMeaning.update).not.toHaveBeenCalled()
  })

  it('removeTranslation removes translation if present', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue({ ...sampleUnit, translations: ['u2', 'u3'] })
    mockDb.unitsOfMeaning.update.mockResolvedValue(undefined)
    await removeTranslation('u1', 'u2')
    expect(mockDb.unitsOfMeaning.update).toHaveBeenCalledWith('u1', { translations: ['u3'] })
  })

  it('removeTranslation does nothing if parent not found', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue(undefined)
    await removeTranslation('notfound', 'u2')
    expect(mockDb.unitsOfMeaning.update).not.toHaveBeenCalled()
  })

  it('removeTranslation does nothing if translations is undefined', async () => {
    mockDb.unitsOfMeaning.get.mockResolvedValue({ ...sampleUnit, translations: undefined })
    await removeTranslation('u1', 'u2')
    expect(mockDb.unitsOfMeaning.update).not.toHaveBeenCalled()
  })
}) 