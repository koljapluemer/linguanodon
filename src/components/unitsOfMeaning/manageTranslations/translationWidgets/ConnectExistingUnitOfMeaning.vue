<template>
  <div class="modal" :class="{ 'is-active': props.open }">
    <div class="modal-background" @click="props.close" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Connect Existing Word or Sentence</p>
        <button class="delete" aria-label="close" @click="props.close" />
      </header>
      <section class="modal-card-body">
        <div class="field">
          <div class="control">
            <input class="input" v-model="search" placeholder="Search by content..." />
          </div>
        </div>
        <div style="max-height: 300px; overflow-y: auto;" @scroll="onScroll">
          <div v-if="props.loading" class="has-text-centered py-4">
            <span class="loader"></span>
          </div>
          <div v-else>
            <div v-if="filteredUnits.length === 0" class="has-text-grey">No results found.</div>
            <ul>
              <li v-for="unit in filteredUnits" :key="unit.id">
                <button class="button is-fullwidth is-light mb-2" @click="select(unit.id)">
                  {{ unit.content }} <span class="has-text-grey-light">({{ unit.languageName }})</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button" @click="props.close">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UnitOfMeaning } from '../../../../types/UnitOfMeaning'

const props = defineProps<{
  open: boolean,
  eligibleUnits: UnitOfMeaning[],
  loading: boolean,
  loadMore: () => void,
  close: () => void
}>()
const emit = defineEmits(['select'])

const search = ref('')

const filteredUnits = computed(() => {
  if (!search.value.trim()) return props.eligibleUnits
  return props.eligibleUnits.filter((u: UnitOfMeaning) => u.content.toLowerCase().includes(search.value.trim().toLowerCase()))
})

function select(id: number | undefined) {
  if (typeof id === 'number') {
    emit('select', id)
    props.close()
  }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    props.loadMore()
  }
}
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
