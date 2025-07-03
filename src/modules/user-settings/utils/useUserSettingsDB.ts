/**
 * Provides a reactive user settings object for the settings view.
 * - Loads from Dexie on first use
 * - Exposes a ref<UserSettings>
 * - Provides a save method to persist changes to Dexie
 * - No Dexie hooks: all changes are controlled by this composable
 *
 * For read-only access elsewhere, just read from Dexie directly.
 */
import { ref } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { UserSettings } from '@/modules/user-settings/UserSettings'
import type { UserSettingsGroup } from '@/modules/user-settings/types/UserSettingsGroup'
import { ALL_USER_SETTINGS_GROUPS } from '@/modules/user-settings/types/UserSettingsGroup'

const USER_SETTINGS_ID = 'current'

const defaultSettings: UserSettings & { id: string } = {
  id: USER_SETTINGS_ID,
  primaryNativeLanguages: [],
  secondaryNativeLanguages: [],
  primaryTargetLanguages: [],
  secondaryTargetLanguages: [],
}

/**
 * Returns a reactive user settings object for the settings view.
 * - Loads from Dexie on first use
 * - Exposes a ref<UserSettings>
 * - Provides a save method to persist changes to Dexie
 * - No Dexie hooks: all changes are controlled by this composable
 *
 * For read-only access elsewhere, just read from Dexie directly.
 */
export function useUserSettings() {
  const userSettings = ref<UserSettings & { id: string }>({ ...defaultSettings })
  const loaded = ref(false)

  /**
   * Loads user settings from Dexie, or creates default if missing.
   */
  async function load() {
    const settings = await db.userSettings.get(USER_SETTINGS_ID)
    if (settings) {
      userSettings.value = { ...settings }
    } else {
      await db.userSettings.put({ ...defaultSettings })
      userSettings.value = { ...defaultSettings }
    }
    loaded.value = true
  }

  /**
   * Saves the current userSettings ref to Dexie, ensuring all arrays are plain.
   */
  async function save() {
    // Deep clone to plain object/arrays
    const plain = JSON.parse(JSON.stringify(userSettings.value))
    await db.userSettings.put(plain)
  }

  // Load on composable creation
  load()

  return {
    userSettings,
    loaded,
    load,
    save,
  }
}

/**
 * Moves a language to the specified group, ensuring it is removed from all other groups first. Persists to Dexie. Used for all group-changing UI actions.
 */
export async function addLanguageToGroup(lang: string, group: UserSettingsGroup) {
  const settings = (await db.userSettings.get(USER_SETTINGS_ID)) || { ...defaultSettings }
  // Remove from all groups
  for (const g of ALL_USER_SETTINGS_GROUPS) {
    settings[g] = settings[g].filter((l: string) => l !== lang)
  }
  // Add to target group
  settings[group].push(lang)
  await db.userSettings.put(settings)
}

/**
 * Removes a language from the specified group and persists to Dexie. Used for all group-removal UI actions.
 */
export async function removeLanguageFromGroup(lang: string, group: UserSettingsGroup) {
  const settings = (await db.userSettings.get(USER_SETTINGS_ID)) || { ...defaultSettings }
  settings[group] = settings[group].filter((l: string) => l !== lang)
  await db.userSettings.put(settings)
}

/**
 * Promotes a language from secondary to primary group (within native or target), persists to Dexie, and ensures no duplicates.
 */
export async function promoteLanguage(lang: string, type: 'native' | 'target') {
  const settings = (await db.userSettings.get(USER_SETTINGS_ID)) || { ...defaultSettings }
  const primary = type === 'native' ? 'primaryNativeLanguages' : 'primaryTargetLanguages'
  const secondary = type === 'native' ? 'secondaryNativeLanguages' : 'secondaryTargetLanguages'
  // Remove from both groups
  settings[primary] = settings[primary].filter((l: string) => l !== lang)
  settings[secondary] = settings[secondary].filter((l: string) => l !== lang)
  // Add to primary
  settings[primary].push(lang)
  await db.userSettings.put(settings)
}

/**
 * Demotes a language from primary to secondary group (within native or target), persists to Dexie, and ensures no duplicates.
 */
export async function demoteLanguage(lang: string, type: 'native' | 'target') {
  const settings = (await db.userSettings.get(USER_SETTINGS_ID)) || { ...defaultSettings }
  const primary = type === 'native' ? 'primaryNativeLanguages' : 'primaryTargetLanguages'
  const secondary = type === 'native' ? 'secondaryNativeLanguages' : 'secondaryTargetLanguages'
  // Remove from both groups
  settings[primary] = settings[primary].filter((l: string) => l !== lang)
  settings[secondary] = settings[secondary].filter((l: string) => l !== lang)
  // Add to secondary
  settings[secondary].push(lang)
  await db.userSettings.put(settings)
} 