<template>
  <div v-if="allLanguages.length" class="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Native Languages -->
    <div>
      <h2 class="text-xl font-bold mb-2">Native Languages</h2>
      <div class="mb-6">
        <h3 class="font-semibold mb-1">Primary</h3>
        <LanguageGroup
          :all-languages="allLanguages"
          :selected-tags="primaryNative"
          @add="(tag: string) => addLanguage('primaryNative', tag)"
          @remove="(tag: string) => removeLanguage('primaryNative', tag)"
        />
      </div>
      <div>
        <h3 class="font-semibold mb-1">Secondary</h3>
        <LanguageGroup
          :all-languages="allLanguages"
          :selected-tags="secondaryNative"
          @add="(tag: string) => addLanguage('secondaryNative', tag)"
          @remove="(tag: string) => removeLanguage('secondaryNative', tag)"
        />
      </div>
    </div>
    <!-- Target Languages -->
    <div>
      <h2 class="text-xl font-bold mb-2">Target Languages</h2>
      <div class="mb-6">
        <h3 class="font-semibold mb-1">Primary</h3>
        <LanguageGroup
          :all-languages="allLanguages"
          :selected-tags="primaryTarget"
          @add="(tag: string) => addLanguage('primaryTarget', tag)"
          @remove="(tag: string) => removeLanguage('primaryTarget', tag)"
        />
      </div>
      <div>
        <h3 class="font-semibold mb-1">Secondary</h3>
        <LanguageGroup
          :all-languages="allLanguages"
          :selected-tags="secondaryTarget"
          @add="(tag: string) => addLanguage('secondaryTarget', tag)"
          @remove="(tag: string) => removeLanguage('secondaryTarget', tag)"
        />
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-32">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/dexie/db'
import type { Language } from '@/types/persistent-general-data/Language'
import LanguageGroup from '@/components/languages/LanguageGroup.vue'

const BACKEND_LANG_URL = 'https://scintillating-empanada-73O0581.netlify.app/language_tags.json'
const allLanguages = ref<Language[]>([])

const primaryNative = ref<string[]>([])
const secondaryNative = ref<string[]>([])
const primaryTarget = ref<string[]>([])
const secondaryTarget = ref<string[]>([])

async function seedLanguagesIfNeeded() {
  const count = await db.languages.count()
  if (count === 0) {
    const res = await fetch(BACKEND_LANG_URL)
    const langs: Language[] = await res.json()
    await db.languages.bulkAdd(langs)
  }
}

async function loadAllLanguages() {
  await seedLanguagesIfNeeded()
  allLanguages.value = await db.languages.toArray()
}

async function loadUserLanguages() {
  const settings = await db.userSettings.get(0)
  primaryNative.value = settings?.primaryNativeLanguages ?? []
  secondaryNative.value = settings?.secondaryNativeLanguages ?? []
  primaryTarget.value = settings?.primaryTargetLanguages ?? []
  secondaryTarget.value = settings?.secondaryTargetLanguages ?? []
}

async function saveUserLanguages() {
  await db.userSettings.put({
    id: 0,
    primaryNativeLanguages: primaryNative.value,
    secondaryNativeLanguages: secondaryNative.value,
    primaryTargetLanguages: primaryTarget.value,
    secondaryTargetLanguages: secondaryTarget.value,
  })
}

async function addLanguage(group: string, tag: string) {
  const arr = getGroupRef(group)
  if (!arr.value.includes(tag)) {
    arr.value.push(tag)
    await saveUserLanguages()
  }
}

async function removeLanguage(group: string, tag: string) {
  const arr = getGroupRef(group)
  const idx = arr.value.indexOf(tag)
  if (idx !== -1) {
    arr.value.splice(idx, 1)
    await saveUserLanguages()
  }
}

function getGroupRef(group: string) {
  switch (group) {
    case 'primaryNative': return primaryNative
    case 'secondaryNative': return secondaryNative
    case 'primaryTarget': return primaryTarget
    case 'secondaryTarget': return secondaryTarget
    default: throw new Error('Invalid group')
  }
}

onMounted(async () => {
  await loadAllLanguages()
  await loadUserLanguages()
})
</script>

