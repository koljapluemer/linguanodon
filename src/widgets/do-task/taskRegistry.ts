import type { Component } from "vue";

// Import all task widgets
import RenderTaskForAddingPronunciation from "@/tasks/task-vocab-add-pronunciation/RenderTaskForAddingPronunciation.vue";
import RenderExtractKnowledgeFromResource from "@/tasks/task-resource-extract-knowledge/RenderExtractKnowledgeFromResource.vue";
import TaskAddSubGoals from "@/tasks/task-goal-add-sub-goals/TaskAddSubGoals.vue";
import TaskAddVocabToGoal from "@/tasks/task-goal-add-vocab/TaskAddVocabToGoal.vue";
import TaskVocabTryToRemember from "@/tasks/task-vocab-try-to-remember/TaskVocabTryToRemember.vue";
import TaskVocabReveal from "@/tasks/task-vocab-reveal/TaskVocabReveal.vue";
import TaskVocabChooseFromOptions from "@/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue";
import type { TaskName } from "@/entities/tasks/TaskData";

export const taskRegistry: Record<TaskName, Component> = {
  "add-pronunciation": RenderTaskForAddingPronunciation,
  "extract-knowledge-from-resource": RenderExtractKnowledgeFromResource,
  "add-sub-goals": TaskAddSubGoals,
  "add-vocab-to-goal": TaskAddVocabToGoal,
  "vocab-try-to-remember": TaskVocabTryToRemember,
  "vocab-reveal-target-to-native": TaskVocabReveal,
  "vocab-reveal-native-to-target": TaskVocabReveal,
  "vocab-choose-from-two-target-to-native": TaskVocabChooseFromOptions,
  "vocab-choose-from-two-native-to-target": TaskVocabChooseFromOptions,
  "vocab-choose-from-four-target-to-native": TaskVocabChooseFromOptions,
  "vocab-choose-from-four-native-to-target": TaskVocabChooseFromOptions,
};

export const TASK_REGISTRY_INJECTION_KEY = Symbol("taskRegistry");
