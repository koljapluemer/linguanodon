/**
 * Valid group names for user language preferences.
 */
export type UserSettingsGroup =
  | 'primaryNativeLanguages'
  | 'secondaryNativeLanguages'
  | 'primaryTargetLanguages'
  | 'secondaryTargetLanguages'

/**
 * All valid group names as an array (for iteration, validation, etc.)
 */
export const ALL_USER_SETTINGS_GROUPS: UserSettingsGroup[] = [
  'primaryNativeLanguages',
  'secondaryNativeLanguages',
  'primaryTargetLanguages',
  'secondaryTargetLanguages',
] 