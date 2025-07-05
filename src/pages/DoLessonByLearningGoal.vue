<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Do Lesson</h1>
      <p class="text-base-content/70">
        Learning Goal: {{ learningGoalUid }}
      </p>
    </div>

    <DoLessonController :learning-goal-uid="learningGoalUid" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import DoLessonController from "@/components/DoLessonController.vue";

const route = useRoute();

const learningGoalUid = computed(() => {
  const uid = route.params.learningGoalUid;
  if (typeof uid === "string") {
    return uid;
  }
  if (Array.isArray(uid)) {
    return uid[0];
  }
  throw new Error("Invalid learning goal UID in route parameters");
});
</script>
