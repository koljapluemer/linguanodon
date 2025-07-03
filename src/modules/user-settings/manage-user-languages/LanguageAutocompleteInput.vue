<script setup lang="ts">
/**
 * Language autocomplete input for selecting a language from a list.
 * - Shows a text input; as user types, shows a dropdown with filtered results (case-insensitive, partial match on code or name)
 * - Dropdown appears after first character typed, closes on selection, Escape, or outside click
 * - Keyboard navigation: up/down arrows, Enter to select, Escape to close
 * - Emits 'select' with the selected language object
 * - Clears input after selection
 * - Uses DaisyUI + Tailwind for styling
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Language } from '@/modules/languages/types/Language'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  languages: Language[]
  placeholder?: string
  disabled?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', lang: Language): void
}>()

const input = ref('')
const isOpen = ref(false)
const highlighted = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)
const dropdownEl = ref<HTMLDivElement | null>(null)

const filtered = computed(() => {
  if (!input.value) return []
  const q = input.value.toLowerCase()
  return props.languages.filter(l =>
    l.tag.toLowerCase().includes(q) ||
    l.name.toLowerCase().includes(q)
  )
})

function openDropdown() {
  if (input.value) isOpen.value = true
}
function closeDropdown() {
  isOpen.value = false
  highlighted.value = -1
}
function selectLang(lang: Language) {
  emit('select', lang)
  input.value = ''
  closeDropdown()
}
function onInput(e: Event) {
  input.value = (e.target as HTMLInputElement).value
  openDropdown()
}
function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value && input.value) isOpen.value = true
  if (!filtered.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlighted.value = (highlighted.value + 1) % filtered.value.length
    scrollToHighlighted()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlighted.value = (highlighted.value - 1 + filtered.value.length) % filtered.value.length
    scrollToHighlighted()
  } else if (e.key === 'Enter' && highlighted.value >= 0) {
    e.preventDefault()
    selectLang(filtered.value[highlighted.value])
  } else if (e.key === 'Escape') {
    closeDropdown()
  }
}
function onBlur(e: FocusEvent) {
  // Delay to allow click on dropdown
  setTimeout(() => closeDropdown(), 100)
}
function onFocus() {
  if (input.value) isOpen.value = true
}
function scrollToHighlighted() {
  nextTick(() => {
    if (!dropdownEl.value) return
    const item = dropdownEl.value.querySelector<HTMLElement>(`[data-idx='${highlighted.value}']`)
    if (item) item.scrollIntoView({ block: 'nearest' })
  })
}
function clearInput() {
  input.value = ''
  closeDropdown()
}
// Close dropdown on outside click
function onClickOutside(e: MouseEvent) {
  if (
    !inputEl.value?.contains(e.target as Node) &&
    !dropdownEl.value?.contains(e.target as Node)
  ) {
    closeDropdown()
  }
}
onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
// Reset highlight when input changes
watch(input, () => { highlighted.value = -1 })
</script>

<template>
  <div class="relative w-full max-w-xs">
    <div class="flex items-center">
      <input
        ref="inputEl"
        type="text"
        class="input input-bordered w-full pr-8"
        :placeholder="placeholder || 'Type to search languages'"
        :disabled="disabled"
        v-model="input"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="input" class="btn btn-xs btn-ghost absolute right-2" @click="clearInput" tabindex="-1" aria-label="Clear">
        <X class="size-4" />
      </button>
    </div>
    <div
      v-if="isOpen"
      ref="dropdownEl"
      class="absolute z-20 mt-1 w-full bg-base-100 border border-base-200 rounded shadow-lg max-h-56 overflow-y-auto"
      role="listbox"
    >
      <template v-if="filtered.length">
        <div
          v-for="(lang, idx) in filtered"
          :key="lang.tag"
          :data-idx="idx"
          class="px-3 py-2 cursor-pointer hover:bg-base-200 flex items-center gap-2"
          :class="{ 'bg-primary text-primary-content': idx === highlighted }"
          @mousedown.prevent="selectLang(lang)"
          @mouseenter="highlighted = idx"
          role="option"
          :aria-selected="idx === highlighted"
        >
          <span class="font-mono text-xs text-base-content/60">{{ lang.tag }}</span>
          <span>{{ lang.name }}</span>
        </div>
      </template>
      <div v-else class="px-3 py-2 text-base-content/60 italic select-none">No results</div>
    </div>
  </div>
</template> 