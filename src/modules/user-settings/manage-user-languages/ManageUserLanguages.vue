<script setup lang="ts">
/**
 * Main UI for managing user language preferences.
 * - Renders all four language groups (primary/secondary native/target)
 * - Allows adding a language to each group via dropdown
 * - Uses real composables and state
 */
import { ref } from 'vue'
import RenderLanguageGroup from './RenderLanguageGroup.vue'
import RenderLanguageDropdown from './RenderLanguageDropdown.vue'
import { useUserSettings, addLanguageToGroup } from '@/modules/user-settings/utils/useUserSettingsDB'
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
 * Adds a language to the specified group and reloads user settings.
 */
async function handleAdd(group: GroupKey) {
  const lang = selected.value[group]
  if (!lang) return
  await addLanguageToGroup(lang, groupKeyToSettingsGroup[group])
  await load()
  selected.value[group] = ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-6">
    <h2 class="text-xl font-bold mb-4">Manage Your Languages</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Primary Native -->
      <div>
        <RenderLanguageGroup
          groupName="Primary Native Languages"
          :languages="getLangObjs(userSettings.primaryNativeLanguages)"
          :isPrimary="true"
        />
        <RenderLanguageDropdown
          :languages="canonicalLanguages"
          v-model="selected.primaryNative"
          placeholder="Add primary native language"
        />
        <button
          class="btn btn-primary btn-sm mt-2"
          :disabled="!selected.primaryNative"
          @click="handleAdd('primaryNative')"
        >Add</button>
      </div>
      <!-- Secondary Native -->
      <div>
        <RenderLanguageGroup
          groupName="Secondary Native Languages"
          :languages="getLangObjs(userSettings.secondaryNativeLanguages)"
          :isPrimary="false"
        />
        <RenderLanguageDropdown
          :languages="canonicalLanguages"
          v-model="selected.secondaryNative"
          placeholder="Add secondary native language"
        />
        <button
          class="btn btn-primary btn-sm mt-2"
          :disabled="!selected.secondaryNative"
          @click="handleAdd('secondaryNative')"
        >Add</button>
      </div>
      <!-- Primary Target -->
      <div>
        <RenderLanguageGroup
          groupName="Primary Target Languages"
          :languages="getLangObjs(userSettings.primaryTargetLanguages)"
          :isPrimary="true"
        />
        <RenderLanguageDropdown
          :languages="canonicalLanguages"
          v-model="selected.primaryTarget"
          placeholder="Add primary target language"
        />
        <button
          class="btn btn-primary btn-sm mt-2"
          :disabled="!selected.primaryTarget"
          @click="handleAdd('primaryTarget')"
        >Add</button>
      </div>
      <!-- Secondary Target -->
      <div>
        <RenderLanguageGroup
          groupName="Secondary Target Languages"
          :languages="getLangObjs(userSettings.secondaryTargetLanguages)"
          :isPrimary="false"
        />
        <RenderLanguageDropdown
          :languages="canonicalLanguages"
          v-model="selected.secondaryTarget"
          placeholder="Add secondary target language"
        />
        <button
          class="btn btn-primary btn-sm mt-2"
          :disabled="!selected.secondaryTarget"
          @click="handleAdd('secondaryTarget')"
        >Add</button>
      </div>
    </div>
  </div>
</template>
