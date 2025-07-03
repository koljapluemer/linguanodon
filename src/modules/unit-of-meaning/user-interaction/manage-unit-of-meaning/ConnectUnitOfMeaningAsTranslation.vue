<template>
  <dialog open class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Connect Existing Translation</h3>
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Search</span>
        </label>
        <input class="input input-bordered w-full" type="text" v-model="search" placeholder="Type to search..." />
      </div>
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Results</span>
        </label>
        <select class="select select-bordered w-full" size="4">
          <option v-for="result in filteredResults" :key="result.uid">{{ result.content }} ({{ result.language }})</option>
        </select>
      </div>
      <div class="modal-action">
        <button type="button" class="btn btn-outline">Cancel</button>
        <button type="button" class="btn btn-primary">Confirm</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

defineProps<{
  oppositeLanguageGroup: string
}>()

// Mock search state and results
const search = ref('')
const mockResults: UnitOfMeaning[] = [
  { uid: 'u1', content: 'Bonjour', language: 'fr', linguType: 'word', userCreated: true, context: 'greeting' },
  { uid: 'u2', content: 'Ciao', language: 'it', linguType: 'word', userCreated: true, context: 'greeting' },
  { uid: 'u3', content: 'Hello', language: 'en', linguType: 'word', userCreated: true, context: 'greeting' }
]
const filteredResults = computed(() =>
  mockResults.filter(r => r.content.toLowerCase().includes(search.value.toLowerCase()))
)
</script>

<style scoped>
</style>
