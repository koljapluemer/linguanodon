<template>
  <div>
    <ul class="mb-2">
      <li v-for="lang in selectedLanguages" :key="lang.tag" class="flex items-center justify-between bg-base-200 rounded px-3 py-2 mb-2">
        <span>{{ lang.englishName }} <span class="text-gray-400">({{ lang.nativeName }})</span> <span v-if="lang.abbreviation">{{ lang.abbreviation }}</span></span>
        <button class="btn btn-xs btn-error" @click="$emit('remove', lang.tag)">Remove</button>
      </li>
    </ul>
    <div class="mb-2">
      <div class="relative">
        <input
          v-model="search"
          @input="onSearch"
          type="text"
          placeholder="Search languages..."
          class="input input-bordered w-full pr-10"
        />
        <ul v-if="showDropdown && filteredLanguages.length" class="absolute z-10 w-full bg-base-100 border border-base-200 rounded mt-1 shadow max-h-60 overflow-y-auto">
          <li
            v-for="lang in filteredLanguages"
            :key="lang.tag"
            class="px-4 py-2 cursor-pointer hover:bg-base-200"
            @click="add(lang.tag)"
          >
            {{ lang.englishName }} <span class="text-gray-400">({{ lang.nativeName }})</span> <span v-if="lang.abbreviation">{{ lang.abbreviation }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Language } from '@/types/persistent-general-data/Language'

const props = defineProps<{
  allLanguages: Language[],
  selectedTags: string[],
}>()
const emit = defineEmits<{ (e: 'add', tag: string): void; (e: 'remove', tag: string): void }>()

const search = ref('')
const showDropdown = ref(false)

const selectedLanguages = computed(() =>
  props.selectedTags
    .map(tag => props.allLanguages.find(l => l.tag === tag))
    .filter((l): l is Language => !!l)
)

const filteredLanguages = computed(() => {
  if (!search.value.trim()) return props.allLanguages.filter(l => !props.selectedTags.includes(l.tag) && l && l.englishName && l.nativeName)
  const s = search.value.trim().toLowerCase()
  return props.allLanguages.filter(l =>
    l && l.englishName && l.nativeName &&
    !props.selectedTags.includes(l.tag) &&
    (l.englishName.toLowerCase().includes(s) || l.nativeName.toLowerCase().includes(s))
  )
})

function onSearch() {
  showDropdown.value = !!search.value.trim() && filteredLanguages.value.length > 0
}

function add(tag: string) {
  emit('add', tag)
  search.value = ''
  showDropdown.value = false
}

onMounted(() => {
  // eslint-disable-next-line no-console
  console.log('allLanguages on mount:', props.allLanguages)
})

watch(search, () => {
  // eslint-disable-next-line no-console
  console.log('allLanguages:', props.allLanguages)
  // eslint-disable-next-line no-console
  console.log('filteredLanguages:', filteredLanguages.value)
})
</script> 