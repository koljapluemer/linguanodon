import type { Component } from "vue";

import RenderTaskForAddingPronunciation from "@/tasks/task-vocab-add-pronunciation/RenderTaskForAddingPronunciation.vue";
import RenderTaskForAddingTranslation from "@/tasks/task-vocab-add-translation/RenderTaskForAddingTranslation.vue";
import RenderExtractKnowledgeFromResource from "@/tasks/task-resource-extract-knowledge/RenderExtractKnowledgeFromResource.vue";
import TaskAddSubGoals from "@/tasks/task-goal-add-sub-goals/TaskAddSubGoals.vue";
import TaskAddVocabToGoal from "@/tasks/task-goal-add-vocab/TaskAddVocabToGoal.vue";
import TaskVocabTryToRemember from "@/tasks/task-vocab-try-to-remember/TaskVocabTryToRemember.vue";
import TaskVocabReveal from "@/tasks/task-vocab-reveal/TaskVocabReveal.vue";
import TaskVocabChooseFromOptions from "@/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue";
import TaskClozeChooseFromOptions from "@/tasks/task-cloze-choice/TaskClozeChooseFromOptions.vue";
import TaskClozeReveal from "@/tasks/task-cloze-reveal/TaskClozeReveal.vue";
import type { TaskName } from "@/entities/tasks/Task";

export interface TaskInfo {
  component: Component
  size: 'small' | 'medium' | 'big'
}

export const taskRegistry: Record<TaskName, TaskInfo> = {
  "add-pronunciation": { component: RenderTaskForAddingPronunciation, size: 'small' },
  "add-translation": { component: RenderTaskForAddingTranslation, size: 'small' },
  "extract-knowledge-from-resource": { component: RenderExtractKnowledgeFromResource, size: 'small' },
  "add-sub-goals": { component: TaskAddSubGoals, size: 'small' },
  "add-vocab-to-goal": { component: TaskAddVocabToGoal, size: 'small' },
  "vocab-try-to-remember": { component: TaskVocabTryToRemember, size: 'small' },
  "vocab-reveal-target-to-native": { component: TaskVocabReveal, size: 'small' },
  "vocab-reveal-native-to-target": { component: TaskVocabReveal, size: 'small' },
  "vocab-choose-from-two-target-to-native": { component: TaskVocabChooseFromOptions, size: 'small' },
  "vocab-choose-from-two-native-to-target": { component: TaskVocabChooseFromOptions, size: 'small' },
  "vocab-choose-from-four-target-to-native": { component: TaskVocabChooseFromOptions, size: 'small' },
  "vocab-choose-from-four-native-to-target": { component: TaskVocabChooseFromOptions, size: 'small' },
  "cloze-choose-from-two": { component: TaskClozeChooseFromOptions, size: 'small' },
  "cloze-choose-from-four": { component: TaskClozeChooseFromOptions, size: 'small' },
  "cloze-reveal": { component: TaskClozeReveal, size: 'small' },
};

export const TASK_REGISTRY_INJECTION_KEY = Symbol("taskRegistry");
