<template>
  <tr>
    <td>
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ learningGoal.name }}</span>
      </div>
    </td>
    <td>
      <div class="flex items-center gap-2">
        <router-link
          :to="{ name: 'do-lesson', params: { learningGoalUid: learningGoal.uid } }"
          class="btn btn-primary btn-sm"
          title="Study"
        >
          <BookOpen class="w-4 h-4" />
        </router-link>
        
        <button
          @click="$emit('edit')"
          class="btn btn-secondary btn-sm"
          title="Edit"
        >
          <Edit class="w-4 h-4" />
        </button>
        
        <button
          @click="$emit('delete')"
          class="btn btn-error btn-sm"
          title="Delete"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { BookOpen, Edit, Trash2 } from 'lucide-vue-next'
import type { LearningGoal } from '@/entities/LearningGoal'

interface Props {
  learningGoal: LearningGoal
}

defineProps<Props>()

defineEmits<{
  study: []
  edit: []
  delete: []
}>()
</script>
