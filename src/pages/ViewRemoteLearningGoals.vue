<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">
      Remote Learning Goals for {{ lang_code }}
    </h1>
    <RemoteLearningGoalWidgetListController :language="lang_code" />
  </div>
</template>

<script setup lang="ts">
import RemoteLearningGoalWidgetListController from '@/components/RemoteLearningGoalWidgetListController.vue'

interface Props {
  lang_code: string
}

defineProps<Props>()
</script>
