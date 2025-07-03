<script setup lang="ts">
/**
 * Main UI for managing user language preferences.
 * - Renders all four language groups (primary/secondary native/target)
 * - Allows adding, removing, promoting, and demoting languages
 * - Uses real composables and state
 */
import { ref } from 'vue'
import RenderLanguageGroup from './RenderLanguageGroup.vue'
import LanguageAutocompleteInput from './LanguageAutocompleteInput.vue'
import { useUserSettings, addLanguageToGroup, removeLanguageFromGroup, promoteLanguage, demoteLanguage } from '@/modules/user-settings/utils/useUserSettingsDB'
import { useCanonicalLanguageList } from '@/modules/languages/utils/useLanguagesDB'
import type { UserSettingsGroup } from '@/modules/user-settings/types/UserSettingsGroup'

// Define group key type for UI
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _groupKeys = [
  'primaryNative',
  'secondaryNative',
  'primaryTarget',
  'secondaryTarget',
] as const

type GroupKey = typeof _groupKeys[number]

// Map UI group keys to UserSettingsGroup
const groupKeyToSettingsGroup: Record<GroupKey, UserSettingsGroup> = {
  primaryNative: 'primaryNativeLanguages',
  secondaryNative: 'secondaryNativeLanguages',
  primaryTarget: 'primaryTargetLanguages',
  secondaryTarget: 'secondaryTargetLanguages',
}

const { userSettings, load } = useUserSettings()
const { languages: canonicalLanguages } = useCanonicalLanguageList()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selected = ref<Record<GroupKey, string>>({
  primaryNative: '',
  secondaryNative: '',
  primaryTarget: '',
  secondaryTarget: ''
})

/**
 * Returns canonical language objects for the given tags.
 */
function getLangObjs(tags: string[]) {
  return canonicalLanguages.value.filter(l => tags.includes(l.tag))
}

/**
 * Returns canonical languages not already present in any group for dropdowns.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAvailableLangs(_group: GroupKey) {
  // Exclude languages already present in any group
  const allUsed = new Set([
    ...userSettings.value.primaryNativeLanguages,
    ...userSettings.value.secondaryNativeLanguages,
    ...userSettings.value.primaryTargetLanguages,
    ...userSettings.value.secondaryTargetLanguages,
  ])
  return canonicalLanguages.value.filter(l => !allUsed.has(l.tag))
}

/**
 * Removes a language from the specified group and reloads user settings.
 */
async function handleRemove(lang: string, group: UserSettingsGroup) {
  await removeLanguageFromGroup(lang, group)
  await load()
}

/**
 * Promotes a language from secondary to primary and reloads user settings.
 */
async function handlePromote(lang: string, type: 'native' | 'target') {
  await promoteLanguage(lang, type)
  await load()
}

/**
 * Demotes a language from primary to secondary and reloads user settings.
 */
async function handleDemote(lang: string, type: 'native' | 'target') {
  await demoteLanguage(lang, type)
  await load()
}

/**
 * Adds a language to the specified group immediately when selected from autocomplete.
 */
async function handleAddImmediate(lang: { tag: string }, group: GroupKey) {
  await addLanguageToGroup(lang.tag, groupKeyToSettingsGroup[group])
  await load()
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-6">
    <h2 class="text-xl font-bold mb-4">Manage Your Languages</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Native Languages Column -->
      <div class="flex flex-col gap-6 min-h-[24rem]">
        <!-- Primary Native -->
        <div class="flex-1 flex flex-col justify-between">
          <RenderLanguageGroup
            groupName="Primary Native Languages"
            :languages="getLangObjs(userSettings.primaryNativeLanguages)"
            :isPrimary="true"
            :onRemove="lang => handleRemove(lang, 'primaryNativeLanguages')"
            :onDemote="lang => handleDemote(lang, 'native')"
            :showDemote="true"
          />
          <LanguageAutocompleteInput
            :languages="getAvailableLangs('primaryNative')"
            placeholder="Add primary native language"
            @select="lang => handleAddImmediate(lang, 'primaryNative')"
          />
        </div>
        <!-- Secondary Native -->
        <div class="flex-1 flex flex-col justify-between">
          <RenderLanguageGroup
            groupName="Secondary Native Languages"
            :languages="getLangObjs(userSettings.secondaryNativeLanguages)"
            :isPrimary="false"
            :onRemove="lang => handleRemove(lang, 'secondaryNativeLanguages')"
            :onPromote="lang => handlePromote(lang, 'native')"
            :showPromote="true"
          />
          <LanguageAutocompleteInput
            :languages="getAvailableLangs('secondaryNative')"
            placeholder="Add secondary native language"
            @select="lang => handleAddImmediate(lang, 'secondaryNative')"
          />
        </div>
      </div>
      <!-- Target Languages Column -->
      <div class="flex flex-col gap-6 min-h-[24rem]">
        <!-- Primary Target -->
        <div class="flex-1 flex flex-col justify-between">
          <RenderLanguageGroup
            groupName="Primary Target Languages"
            :languages="getLangObjs(userSettings.primaryTargetLanguages)"
            :isPrimary="true"
            :onRemove="lang => handleRemove(lang, 'primaryTargetLanguages')"
            :onDemote="lang => handleDemote(lang, 'target')"
            :showDemote="true"
          />
          <LanguageAutocompleteInput
            :languages="getAvailableLangs('primaryTarget')"
            placeholder="Add primary target language"
            @select="lang => handleAddImmediate(lang, 'primaryTarget')"
          />
        </div>
        <!-- Secondary Target -->
        <div class="flex-1 flex flex-col justify-between">
          <RenderLanguageGroup
            groupName="Secondary Target Languages"
            :languages="getLangObjs(userSettings.secondaryTargetLanguages)"
            :isPrimary="false"
            :onRemove="lang => handleRemove(lang, 'secondaryTargetLanguages')"
            :onPromote="lang => handlePromote(lang, 'target')"
            :showPromote="true"
          />
          <LanguageAutocompleteInput
            :languages="getAvailableLangs('secondaryTarget')"
            placeholder="Add secondary target language"
            @select="lang => handleAddImmediate(lang, 'secondaryTarget')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
