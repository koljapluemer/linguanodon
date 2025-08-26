import { ref } from 'vue';
import type { TaskName } from '@/entities/tasks/Task';

const WINDOW_SIZE = 30;
const MAX_NEW_VOCAB_TASKS_RECENT = 3;
const MAX_NEW_VOCAB_TASKS_DAILY = 20;
const STORAGE_KEY = 'linguanodon_daily_new_vocab';

// Tasks that work with new/unseen vocab (level -1)
const NEW_VOCAB_TASKS: TaskName[] = ['vocab-try-to-remember'];

const recentTasks = ref<TaskName[]>([]);

interface DailyVocabData {
  date: string;
  count: number;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getDailyVocabCount(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    
    const data: DailyVocabData = JSON.parse(stored);
    const today = getTodayString();
    
    // Reset count if it's a new day
    if (data.date !== today) {
      return 0;
    }
    
    return data.count;
  } catch {
    return 0;
  }
}

function incrementDailyVocabCount(): void {
  try {
    const today = getTodayString();
    const currentCount = getDailyVocabCount();
    
    const data: DailyVocabData = {
      date: today,
      count: currentCount + 1
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to update daily vocab count:', error);
  }
}

export function useNewVocabTracker() {
  
  function trackTask(taskName: TaskName) {
    recentTasks.value.push(taskName);
    
    // Keep only the last WINDOW_SIZE tasks
    if (recentTasks.value.length > WINDOW_SIZE) {
      recentTasks.value = recentTasks.value.slice(-WINDOW_SIZE);
    }
    
    // If this is a new vocab task, increment daily counter
    if (NEW_VOCAB_TASKS.includes(taskName)) {
      incrementDailyVocabCount();
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
    
    // Check daily limit (20 per day)
    if (getDailyVocabCount() >= MAX_NEW_VOCAB_TASKS_DAILY) {
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
    getDailyVocabCount,
    canGenerateNewVocabTask,
    isNewVocabTask,
    recentTasks: recentTasks.value
  };
}