import type { Component } from "vue";

import RenderTaskForAddingTranslation from "@/pages/practice/tasks/task-vocab-add-translation/RenderTaskForAddingTranslation.vue";
import RenderExtractKnowledgeFromResource from "@/pages/practice/tasks/task-resource-extract-knowledge/RenderExtractKnowledgeFromResource.vue";
import TaskAddSubGoals from "@/pages/practice/tasks/task-goal-add-sub-goals/TaskAddSubGoals.vue";
import TaskAddVocabToGoal from "@/pages/practice/tasks/task-goal-add-vocab/TaskAddVocabToGoal.vue";
import TaskVocabTryToRemember from "@/pages/practice/tasks/task-vocab-try-to-remember/TaskVocabTryToRemember.vue";
import TaskGuessWhatSentenceMeans from "@/pages/practice/tasks/task-guess-what-sentence-means/TaskGuessWhatSentenceMeans.vue";
import TaskVocabReveal from "@/pages/practice/tasks/task-vocab-reveal/TaskVocabReveal.vue";
import TaskVocabChooseFromOptions from "@/pages/practice/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue";
import TaskClozeChooseFromOptions from "@/pages/practice/tasks/task-cloze-choice/TaskClozeChooseFromOptions.vue";
import TaskClozeReveal from "@/pages/practice/tasks/task-cloze-reveal/TaskClozeReveal.vue";
import TaskVocabFormSentence from "@/pages/practice/tasks/task-vocab-form-sentence/TaskVocabFormSentence.vue";
import TaskFactCardTryToRemember from "@/pages/practice/tasks/task-fact-card-try-to-remember/TaskFactCardTryToRemember.vue";
import TaskFactCardReveal from "@/pages/practice/tasks/task-fact-card-reveal/TaskFactCardReveal.vue";
import TaskAddImageToVocab from "@/pages/practice/tasks/task-add-image-to-vocab/TaskAddImageToVocab.vue";
import TaskVocabChooseImageBySound from "@/pages/practice/tasks/task-vocab-choose-image-by-sound/TaskVocabChooseImageBySound.vue";

export interface TaskInfo {
  component: Component
  size: 'small' | 'medium' | 'big'
}

export const taskRegistry: Record<string, TaskInfo> = {
  "add-translation": { component: RenderTaskForAddingTranslation, size: 'medium' },
  "extract-knowledge-from-resource": { component: RenderExtractKnowledgeFromResource, size: 'big' },
  "add-sub-goals": { component: TaskAddSubGoals, size: 'medium' },
  "add-vocab-to-goal": { component: TaskAddVocabToGoal, size: 'medium' },
  "vocab-try-to-remember": { component: TaskVocabTryToRemember, size: 'small' },
  "guess-what-sentence-means": { component: TaskGuessWhatSentenceMeans, size: 'medium' },
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
  "fact-card-try-to-remember": { component: TaskFactCardTryToRemember, size: 'small' },
  "fact-card-reveal": { component: TaskFactCardReveal, size: 'small' },
  "add-image-to-vocab": { component: TaskAddImageToVocab, size: 'medium' },
  "vocab-choose-image-by-sound": { component: TaskVocabChooseImageBySound, size: 'medium' },
};

export const TASK_REGISTRY_INJECTION_KEY = Symbol("taskRegistry");
