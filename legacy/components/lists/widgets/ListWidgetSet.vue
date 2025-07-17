<template>
  <tr>
    <td class="font-medium">{{ set.uid }}</td>
    <td>{{ set.language }}</td>
    <td>
      <div class="text-sm">
        {{ set.tasks.join(', ') }}
      </div>
    </td>
    <td>{{ set.unitsOfMeaning.length }}</td>
    <td>
      <button
        @click="handlePractice"
        class="btn btn-primary btn-sm"
        title="Practice this set"
      >
        <BookOpen class="w-4 h-4 mr-1" />
        Practice
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import type { Set } from '@/entities/Set'

interface Props {
  set: Set
}

interface Emits {
  (e: 'practice', setUid: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Emits practice event for this set
 */
function handlePractice() {
  emit('practice', props.set.uid)
}
</script>
