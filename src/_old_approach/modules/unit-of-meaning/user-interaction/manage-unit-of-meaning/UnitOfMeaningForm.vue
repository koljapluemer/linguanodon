<template>
  <form class="space-y-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Content</span>
      </label>
      <input class="input input-bordered w-full" type="text" v-model="unit.content" />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Linguistic Type</span>
      </label>
      <input class="input input-bordered w-full" type="text" v-model="unit.linguType" />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Pronunciation</span>
      </label>
      <input class="input input-bordered w-full" type="text" v-model="unit.pronunciation" />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Notes</span>
      </label>
      <textarea class="textarea textarea-bordered w-full" v-model="unit.notes"></textarea>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Language</span>
      </label>
      <select class="select select-bordered w-full" v-model="unit.language">
        <optgroup label="Primary Target Languages">
          <option v-for="lang in primaryTargetLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Primary Native Languages">
          <option v-for="lang in primaryNativeLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Secondary Target Languages">
          <option v-for="lang in secondaryTargetLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Secondary Native Languages">
          <option v-for="lang in secondaryNativeLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
      </select>
    </div>
    <div v-if="showTranslations" class="mt-6">
      <TranslationsWidget 
        :parentUnit="props.unit"
        @addTranslation="handleAddTranslation"
        @removeTranslation="handleRemoveTranslation"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserSettings } from '@/modules/user-settings/utils/useUserSettingsDB'
import { useCanonicalLanguageList } from '@/modules/languages/utils/useLanguagesDB'
import TranslationsWidget from './TranslationsWidget.vue'
import { addTranslation, removeTranslation } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'
import type { Language } from '@/modules/languages/types/Language'

const props = defineProps<{
  unit: UnitOfMeaning
  showTranslations?: boolean
}>()

const { userSettings } = useUserSettings()
const { languages: canonicalLanguages } = useCanonicalLanguageList()

// Get language objects by tags from user settings
const primaryTargetLanguages = computed(() => 
  userSettings.value.primaryTargetLanguages
    .map(tag => canonicalLanguages.value.find((lang: Language) => lang.tag === tag))
    .filter(Boolean) as Language[]
)

const primaryNativeLanguages = computed(() => 
  userSettings.value.primaryNativeLanguages
    .map(tag => canonicalLanguages.value.find((lang: Language) => lang.tag === tag))
    .filter(Boolean) as Language[]
)

const secondaryTargetLanguages = computed(() => 
  userSettings.value.secondaryTargetLanguages
    .map(tag => canonicalLanguages.value.find((lang: Language) => lang.tag === tag))
    .filter(Boolean) as Language[]
)

const secondaryNativeLanguages = computed(() => 
  userSettings.value.secondaryNativeLanguages
    .map(tag => canonicalLanguages.value.find((lang: Language) => lang.tag === tag))
    .filter(Boolean) as Language[]
)

/**
 * Handles adding a translation to the current unit.
 */
async function handleAddTranslation(translationUid: string) {
  if (!props.unit.uid) return
  await addTranslation(props.unit.uid, translationUid)
  // The parent will handle refreshing the unit
}

/**
 * Handles removing a translation from the current unit.
 */
async function handleRemoveTranslation(translationUid: string) {
  if (!props.unit.uid) return
  await removeTranslation(props.unit.uid, translationUid)
  // The parent will handle refreshing the unit
}
</script>

<style scoped>
</style>
