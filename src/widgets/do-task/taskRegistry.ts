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
import TaskVocabFormSentence from "@/tasks/task-vocab-form-sentence/TaskVocabFormSentence.vue";

export interface TaskInfo {
  component: Component
  size: 'small' | 'medium' | 'big'
}

export const taskRegistry: Record<string, TaskInfo> = {
  "add-pronunciation": { component: RenderTaskForAddingPronunciation, size: 'big' },
  "add-translation": { component: RenderTaskForAddingTranslation, size: 'medium' },
  "extract-knowledge-from-resource": { component: RenderExtractKnowledgeFromResource, size: 'big' },
  "add-sub-goals": { component: TaskAddSubGoals, size: 'medium' },
  "add-vocab-to-goal": { component: TaskAddVocabToGoal, size: 'medium' },
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
  "vocab-form-sentence": { component: TaskVocabFormSentence, size: 'medium' },
  "vocab-form-sentence-single": { component: TaskVocabFormSentence, size: 'medium' },
};

export const TASK_REGISTRY_INJECTION_KEY = Symbol("taskRegistry");
