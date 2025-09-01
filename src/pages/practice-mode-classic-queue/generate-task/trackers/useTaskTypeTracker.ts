import { ref } from 'vue';
import type { TaskName } from '@/entities/tasks/Task';
import { pickRandomFromSortedList } from '@/shared/arrayUtils';

const WINDOW_SIZE = 50;

const recentTasks = ref<TaskName[]>([]);

export function useTaskTypeTracker() {
  
  function trackTask(taskName: TaskName) {
    recentTasks.value.push(taskName);
    
    // Keep only the last WINDOW_SIZE tasks
    if (recentTasks.value.length > WINDOW_SIZE) {
      recentTasks.value = recentTasks.value.slice(-WINDOW_SIZE);
    }
  }
  
  function getTaskCount(taskName: TaskName): number {
    return recentTasks.value.filter(name => name === taskName).length;
  }
  
  
  function getTaskCounts(): Record<TaskName, number> {
    const counts: Record<string, number> = {};
    recentTasks.value.forEach(taskName => {
      counts[taskName] = (counts[taskName] || 0) + 1;
    });
    return counts as Record<TaskName, number>;
  }
  
  function getRareTaskNames(availableTaskNames: TaskName[]): TaskName[] {
    const taskCounts = getTaskCounts();
    
    // Sort by count (ascending) - tasks with lower counts come first
    const sortedTasks = availableTaskNames
      .map(taskName => ({
        taskName,
        count: taskCounts[taskName] || 0
      }))
      .sort((a, b) => a.count - b.count)
      .map(item => item.taskName);
    
    return sortedTasks;
  }
  
  function recommendRareTask(availableTaskNames: TaskName[]): TaskName | null {
    const rareTasksSorted = getRareTaskNames(availableTaskNames);
    return pickRandomFromSortedList(rareTasksSorted);
  }
  
  return {
    trackTask,
    getTaskCount,
    getTaskCounts,
    getRareTaskNames,
    recommendRareTask,
    recentTasks: recentTasks.value
  };
}