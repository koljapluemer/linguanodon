<template>
  <div class="container mx-auto p-4">
    <PracticeTaskControl :task-id="taskId" />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useRoute } from 'vue-router'
import PracticeTaskControl from '@/components/practice/task/PracticeTaskControl.vue'
import { piniaTaskRepository } from '@/repositories/pinia/useRepoPiniaTasks'
import { piniaUnitOfMeaningRepository } from '@/repositories/pinia/useRepoPiniaUnitsOfMeaning'
import { piniaExerciseRepository } from '@/repositories/pinia/useRepoPiniaExercises'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, exerciseRepositoryKey } from '@/types/injectionKeys'

const route = useRoute()
const taskId = route.params.taskId as string

// Provide repositories to child components
provide(taskRepositoryKey, piniaTaskRepository)
provide(unitOfMeaningRepositoryKey, piniaUnitOfMeaningRepository)
provide(exerciseRepositoryKey, piniaExerciseRepository)
</script>
