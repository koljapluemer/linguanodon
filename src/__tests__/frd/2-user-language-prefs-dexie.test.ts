import { describe, it, expect, beforeEach } from 'vitest'
import type { UserSettings } from '@/modules/user-settings/UserSettings'
import { useUserSettings, addLanguageToGroup, removeLanguageFromGroup, promoteLanguage, demoteLanguage } from '@/modules/user-settings/utils/useUserSettingsDB'
import { db } from '@/modules/db/db-local/accessLocalDB'

// Utility to wait for userSettings to be loaded
async function waitForLoaded(loadedRef: { value: boolean }) {
  while (!loadedRef.value) {
    await new Promise(r => setTimeout(r, 0))
  }
}

describe('User Language Preferences Dexie Table & Composable (FRD)', () => {
  beforeEach(async () => {
    await db.userSettings.clear()
  })

  it('creates the userSettings table with correct schema', async () => {
    // Check that the table exists
    expect(db.userSettings).toBeDefined()
    // Check that the primary key is 'id'
    const schema = db.userSettings.schema.primKey
    expect(schema.keyPath).toBe('id')
  })

  it('can read and write the full user settings object', async () => {
    const settings: UserSettings & { id: string } = {
      id: 'current',
      primaryNativeLanguages: ['en'],
      secondaryNativeLanguages: ['fr'],
      primaryTargetLanguages: ['de'],
      secondaryTargetLanguages: ['es'],
    }
    await db.userSettings.put(settings)
    const fromDb = await db.userSettings.get('current')
    expect(fromDb).toEqual(settings)
  })

  it('returns a reactive user settings object', async () => {
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    const settings: UserSettings & { id: string } = {
      id: 'current',
      primaryNativeLanguages: ['en'],
      secondaryNativeLanguages: ['fr'],
      primaryTargetLanguages: ['de'],
      secondaryTargetLanguages: ['es'],
    }
    // Simulate user editing settings
    userSettings.value = { ...settings }
    await db.userSettings.put(settings)
    await load()
    expect(userSettings.value).toMatchObject({
      primaryNativeLanguages: ['en'],
      secondaryNativeLanguages: ['fr'],
      primaryTargetLanguages: ['de'],
      secondaryTargetLanguages: ['es'],
    })
  })

  it('addLanguageToGroup adds a language to the correct group and persists', async () => {
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    await addLanguageToGroup('en', 'primaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toContain('en')
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb?.primaryNativeLanguages).toContain('en')
  })

  it('removeLanguageFromGroup removes a language from the correct group and persists', async () => {
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    await addLanguageToGroup('en', 'primaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toContain('en')
    await removeLanguageFromGroup('en', 'primaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).not.toContain('en')
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb?.primaryNativeLanguages).not.toContain('en')
  })

  it('promoteLanguage/demoteLanguage move a language between primary/secondary within a type', async () => {
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    // Add to secondary native
    await addLanguageToGroup('fr', 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toContain('fr')
    expect(userSettings.value.primaryNativeLanguages).not.toContain('fr')
    // Promote to primary
    await promoteLanguage('fr', 'native')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toContain('fr')
    expect(userSettings.value.secondaryNativeLanguages).not.toContain('fr')
    // Demote back to secondary
    await demoteLanguage('fr', 'native')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toContain('fr')
    expect(userSettings.value.primaryNativeLanguages).not.toContain('fr')
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb?.secondaryNativeLanguages).toContain('fr')
    expect(fromDb?.primaryNativeLanguages).not.toContain('fr')
  })

  it('does not allow duplicates within or across groups', async () => {
    const { userSettings, loaded, load } = useUserSettings()
    await waitForLoaded(loaded)
    // Add to primary native
    await addLanguageToGroup('en', 'primaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).toEqual(['en'])
    // Try to add to secondary native (should move, not duplicate)
    await addLanguageToGroup('en', 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.primaryNativeLanguages).not.toContain('en')
    expect(userSettings.value.secondaryNativeLanguages).toEqual(['en'])
    // Try to add again to secondary native (should not duplicate)
    await addLanguageToGroup('en', 'secondaryNativeLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).toEqual(['en'])
    // Try to add to primary target (should move, not duplicate)
    await addLanguageToGroup('en', 'primaryTargetLanguages')
    await load()
    expect(userSettings.value.secondaryNativeLanguages).not.toContain('en')
    expect(userSettings.value.primaryTargetLanguages).toEqual(['en'])
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb?.primaryNativeLanguages).not.toContain('en')
    expect(fromDb?.secondaryNativeLanguages).not.toContain('en')
    expect(fromDb?.primaryTargetLanguages).toEqual(['en'])
    expect(fromDb?.secondaryTargetLanguages).not.toContain('en')
  })

  it('setting the whole object works and persists', async () => {
    const { userSettings, loaded, load, save } = useUserSettings()
    await waitForLoaded(loaded)
    const newSettings: UserSettings & { id: string } = {
      id: 'current',
      primaryNativeLanguages: ['en'],
      secondaryNativeLanguages: ['fr'],
      primaryTargetLanguages: ['de'],
      secondaryTargetLanguages: ['es'],
    }
    userSettings.value = { ...newSettings }
    await save()
    await load()
    expect(userSettings.value).toEqual(newSettings)
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb).toEqual(newSettings)
  })

  it('data persists across reloads', async () => {
    // Write settings
    const { userSettings, loaded, save } = useUserSettings()
    await waitForLoaded(loaded)
    const settings: UserSettings & { id: string } = {
      id: 'current',
      primaryNativeLanguages: ['en'],
      secondaryNativeLanguages: ['fr'],
      primaryTargetLanguages: ['de'],
      secondaryTargetLanguages: ['es'],
    }
    userSettings.value = { ...settings }
    await save()
    // Simulate reload by creating a new composable instance
    const { userSettings: userSettings2, loaded: loaded2, load: load2 } = useUserSettings()
    await waitForLoaded(loaded2)
    await load2()
    expect(userSettings2.value).toEqual(settings)
    // Check Dexie
    const fromDb = await db.userSettings.get('current')
    expect(fromDb).toEqual(settings)
  })
}) 