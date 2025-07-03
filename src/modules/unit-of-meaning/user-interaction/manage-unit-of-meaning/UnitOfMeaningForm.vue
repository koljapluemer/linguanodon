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
          <option v-for="lang in mockUserSettings.primaryTargetLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Primary Native Languages">
          <option v-for="lang in mockUserSettings.primaryNativeLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Secondary Target Languages">
          <option v-for="lang in mockUserSettings.secondaryTargetLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
        <optgroup label="Secondary Native Languages">
          <option v-for="lang in mockUserSettings.secondaryNativeLanguages" :key="lang.tag" :value="lang.tag">{{ lang.name }}</option>
        </optgroup>
      </select>
    </div>
    <div v-if="showTranslations" class="mt-6">
      <div class="border border-dashed border-base-300 rounded p-4 text-center text-base-content/50">
        TranslationsWidget goes here
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'
import type { Language } from '@/modules/languages/types/Language'

defineProps<{
  unit: UnitOfMeaning
  showTranslations?: boolean
}>()

// Mock user settings and languages for the dropdown
const mockUserSettings = {
  primaryTargetLanguages: [
    { tag: 'en', name: 'English' }
  ],
  primaryNativeLanguages: [
    { tag: 'de', name: 'German' }
  ],
  secondaryTargetLanguages: [
    { tag: 'es', name: 'Spanish' }
  ],
  secondaryNativeLanguages: [
    { tag: 'fr', name: 'French' }
  ]
} as Record<string, Language[]>
</script>

<style scoped>
</style>
