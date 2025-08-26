import { ref } from 'vue';
import type { TaskName } from '@/entities/tasks/Task';

const WINDOW_SIZE = 50;
const MAX_PRONUNCIATION_TASKS = 2;

const recentTasks = ref<TaskName[]>([]);

export function usePronunciationTaskTracker() {
  
  function trackTask(taskName: TaskName) {
    recentTasks.value.push(taskName);
    
    // Keep only the last WINDOW_SIZE tasks
    if (recentTasks.value.length > WINDOW_SIZE) {
      recentTasks.value = recentTasks.value.slice(-WINDOW_SIZE);
    }
  }
  
  function getPronunciationTaskCount(): number {
    return recentTasks.value.filter(taskName => taskName === 'add-pronunciation').length;
  }
  
  function canGeneratePronunciationTask(): boolean {
    return getPronunciationTaskCount() <= MAX_PRONUNCIATION_TASKS;
  }
  
  return {
    trackTask,
    getPronunciationTaskCount,
    canGeneratePronunciationTask,
    recentTasks: recentTasks.value
  };
}