import { describe, it, expect } from 'vitest'
import { getOppositeLanguageGroup, getFirstLanguageInGroup } from './userSettingsLanguageHelpers'
import type { UserSettings } from '@/modules/user-settings/UserSettings'
import type { Language } from '@/modules/languages/types/Language'

describe('getOppositeLanguageGroup', () => {
  it('returns the correct opposite group for all combinations', () => {
    expect(getOppositeLanguageGroup('primaryTargetLanguages')).toBe('primaryNativeLanguages')
    expect(getOppositeLanguageGroup('secondaryTargetLanguages')).toBe('secondaryNativeLanguages')
    expect(getOppositeLanguageGroup('primaryNativeLanguages')).toBe('primaryTargetLanguages')
    expect(getOppositeLanguageGroup('secondaryNativeLanguages')).toBe('secondaryTargetLanguages')
  })
})

describe('getFirstLanguageInGroup', () => {
  const canonicalLanguages: Language[] = [
    { tag: 'en', name: 'English' },
    { tag: 'de', name: 'German' },
    { tag: 'fr', name: 'French' }
  ]
  const userSettings: UserSettings = {
    primaryNativeLanguages: ['German'],
    secondaryNativeLanguages: [],
    primaryTargetLanguages: ['English'],
    secondaryTargetLanguages: ['French']
  }

  it('returns the first language in the group if present', () => {
    expect(getFirstLanguageInGroup(userSettings, 'primaryNativeLanguages', canonicalLanguages)?.name).toBe('German')
    expect(getFirstLanguageInGroup(userSettings, 'primaryTargetLanguages', canonicalLanguages)?.name).toBe('English')
    expect(getFirstLanguageInGroup(userSettings, 'secondaryTargetLanguages', canonicalLanguages)?.name).toBe('French')
  })

  it('returns undefined if group is empty', () => {
    expect(getFirstLanguageInGroup(userSettings, 'secondaryNativeLanguages', canonicalLanguages)).toBeUndefined()
  })

  it('returns undefined if no canonical language matches', () => {
    const userSettings2: UserSettings = {
      ...userSettings,
      primaryNativeLanguages: ['Nonexistent']
    }
    expect(getFirstLanguageInGroup(userSettings2, 'primaryNativeLanguages', canonicalLanguages)).toBeUndefined()
  })
}) 