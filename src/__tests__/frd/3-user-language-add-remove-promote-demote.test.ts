import { describe, it, beforeEach, expect } from 'vitest'
import { addLanguageToGroup, useUserSettings } from '@/modules/user-settings/utils/useUserSettingsDB'
import { db } from '@/modules/db/db-local/accessLocalDB'
import { ALL_USER_SETTINGS_GROUPS } from '@/modules/user-settings/types/UserSettingsGroup'

// Helper: wait for reactivity
async function waitForLoaded(loadedRef: { value: boolean }) {
  while (!loadedRef.value) {
    await new Promise(r => setTimeout(r, 0))
  }
}

// TODO: Mock canonical language list and Dexie as needed

/**
 * FRD 3: Add/Remove/Promote/Demote Languages in User Preferences
 *
 * This suite covers all UI and logic for managing user language groups:
 * - Add/remove to/from any group
 * - Promote/demote within native/target
 * - Deduplication across all groups
 * - Dropdown search and canonical list enforcement
 * - Warnings for empty primary groups
 * - Reactivity and persistence
 */
describe('User Language Preferences UI (FRD 3)', () => {
  beforeEach(async () => {
    await db.userSettings.clear()
  })

  it('can add a language to each group via the UI', async () => {
    // We'll use logic-level helpers since UI is not implemented yet
    const testLangs = ['en', 'fr', 'de', 'es']
    const groups = [...ALL_USER_SETTINGS_GROUPS]
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      const lang = testLangs[i]
      await addLanguageToGroup(lang, group)
      await load() // reload from Dexie
      // Assert language is in the correct group
      expect(userSettings.value[group]).toContain(lang)
      // Assert language is not in any other group
      for (let j = 0; j < groups.length; j++) {
        if (j !== i) {
          expect(userSettings.value[groups[j]]).not.toContain(lang)
        }
      }
    }
  })

  it('removes a language from a group via the UI', async () => {
    // We'll use logic-level helpers since UI is not implemented yet
    const testLang = 'en'
    const group = 'primaryNativeLanguages'
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    // Add the language first
    await addLanguageToGroup(testLang, group)
    await load()
    expect(userSettings.value[group]).toContain(testLang)
    // Remove the language
    const { removeLanguageFromGroup } = await import('@/modules/user-settings/utils/useUserSettingsDB')
    await removeLanguageFromGroup(testLang, group)
    await load()
    // Assert it is removed from the group
    expect(userSettings.value[group]).not.toContain(testLang)
    // Assert it is not present in any group
    for (const g of ALL_USER_SETTINGS_GROUPS) {
      expect(userSettings.value[g]).not.toContain(testLang)
    }
  })

  it('promotes/demotes a language between primary/secondary', async () => {
    // We'll use logic-level helpers since UI is not implemented yet
    const testLang = 'fr'
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    // Add to secondary native
    await addLanguageToGroup(testLang, 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toContain(testLang)
    expect(userSettings.value.primaryNativeLanguages).not.toContain(testLang)
    // Promote to primary
    const { promoteLanguage, demoteLanguage } = await import('@/modules/user-settings/utils/useUserSettingsDB')
    await promoteLanguage(testLang, 'native')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toContain(testLang)
    expect(userSettings.value.secondaryNativeLanguages).not.toContain(testLang)
    // Demote back to secondary
    await demoteLanguage(testLang, 'native')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toContain(testLang)
    expect(userSettings.value.primaryNativeLanguages).not.toContain(testLang)
    // Check not present in target groups
    expect(userSettings.value.primaryTargetLanguages).not.toContain(testLang)
    expect(userSettings.value.secondaryTargetLanguages).not.toContain(testLang)
  })

  it('prevents duplicates within/across groups', async () => {
    // We'll use logic-level helpers since UI is not implemented yet
    const testLang = 'en'
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    // Add to primary native
    await addLanguageToGroup(testLang, 'primaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toEqual([testLang])
    // Try to add to secondary native (should move, not duplicate)
    await addLanguageToGroup(testLang, 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).not.toContain(testLang)
    expect(userSettings.value.secondaryNativeLanguages).toEqual([testLang])
    // Try to add again to secondary native (should not duplicate)
    await addLanguageToGroup(testLang, 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toEqual([testLang])
    // Try to add to primary target (should move, not duplicate)
    await addLanguageToGroup(testLang, 'primaryTargetLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).not.toContain(testLang)
    expect(userSettings.value.primaryTargetLanguages).toEqual([testLang])
    // Check not present in other groups
    expect(userSettings.value.primaryNativeLanguages).not.toContain(testLang)
    expect(userSettings.value.secondaryTargetLanguages).not.toContain(testLang)
  })
})
