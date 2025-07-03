import type { UserSettings } from '@/modules/user-settings/UserSettings'
import type { UserSettingsGroup } from '@/modules/user-settings/types/UserSettingsGroup'
import type { Language } from '@/modules/languages/types/Language'

/**
 * Returns the "opposite" language group for a given group.
 * If group is a target group, returns the corresponding native group, and vice versa.
 */
export function getOppositeLanguageGroup(group: UserSettingsGroup): UserSettingsGroup {
  switch (group) {
    case 'primaryTargetLanguages':
      return 'primaryNativeLanguages'
    case 'secondaryTargetLanguages':
      return 'secondaryNativeLanguages'
    case 'primaryNativeLanguages':
      return 'primaryTargetLanguages'
    case 'secondaryNativeLanguages':
      return 'secondaryTargetLanguages'
  }
}

/**
 * Returns the first Language in a user settings group, matching by tag, or undefined if none.
 */
export function getFirstLanguageInGroup(
  userSettings: UserSettings,
  group: UserSettingsGroup,
  canonicalLanguages: Language[]
): Language | undefined {
  const tags = userSettings[group]
  if (!tags || !tags.length) return undefined
  return canonicalLanguages.find(lang => lang.name === tags[0])
}

 