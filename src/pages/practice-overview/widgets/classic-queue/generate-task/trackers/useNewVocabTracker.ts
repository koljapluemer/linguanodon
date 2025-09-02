import { ref } from 'vue';
import type { TaskName } from '@/entities/tasks/Task';

const WINDOW_SIZE = 30;
const MAX_NEW_VOCAB_TASKS_RECENT = 3;

// Tasks that work with new/unseen vocab (level -1)
const NEW_VOCAB_TASKS: TaskName[] = ['vocab-try-to-remember'];

const recentTasks = ref<TaskName[]>([]);

export function useNewVocabTracker() {

  function trackTask(taskName: TaskName) {
    recentTasks.value.push(taskName);

    // Keep only the last WINDOW_SIZE tasks
    if (recentTasks.value.length > WINDOW_SIZE) {
      recentTasks.value = recentTasks.value.slice(-WINDOW_SIZE);
    }


  }

  function getRecentNewVocabTaskCount(): number {
    return recentTasks.value.filter(taskName => NEW_VOCAB_TASKS.includes(taskName)).length;
  }

  function canGenerateNewVocabTask(): boolean {
    // Check recent window limit (3 in last 30 tasks)
    if (getRecentNewVocabTaskCount() > MAX_NEW_VOCAB_TASKS_RECENT) {
      return false;
    }


    return true;
  }

  function isNewVocabTask(taskName: TaskName): boolean {
    return NEW_VOCAB_TASKS.includes(taskName);
  }

  return {
    trackTask,
    getRecentNewVocabTaskCount,
    canGenerateNewVocabTask,
    isNewVocabTask,
    recentTasks: recentTasks.value
  };
}