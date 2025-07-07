<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Set Name</th>
          <th>Language</th>
          <th>Tasks</th>
          <th>Units</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <ListWidgetSet
          v-for="set in sets"
          :key="set.uid"
          :set="set"
          @practice="handlePractice"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ListWidgetSet from '@/components/lists/widgets/ListWidgetSet.vue'
import type { Set } from '@/entities/Set'

interface Props {
  sets: Set[]
}

interface Emits {
  (e: 'practice-set', setUid: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Forwards practice events from child components
 */
function handlePractice(setUid: string) {
  emit('practice-set', setUid)
}
</script>
