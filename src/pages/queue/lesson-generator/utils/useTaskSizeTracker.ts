import { ref } from 'vue';
import type { TaskName } from '@/entities/tasks/Task';
import { taskRegistry } from '@/widgets/do-task/taskRegistry';
import { pickRandomFromSortedList } from '@/shared/pickRandomFromSortedList';

type TaskSize = 'small' | 'medium' | 'big';

interface TaskSizeTargets {
  big: number;
  medium: number;
  small: number;
}

const TASK_SIZE_TARGETS: TaskSizeTargets = {
  big: 0.05,    // 5%
  medium: 0.10, // 10%
  small: 0.85   // 85%
};

const WINDOW_SIZE = 30;

const recentTasks = ref<TaskSize[]>([]);

export function useTaskSizeTracker() {
  
  function trackTask(taskName: TaskName) {
    const taskInfo = taskRegistry[taskName];
    if (!taskInfo) {
      console.warn(`Task ${taskName} not found in registry`);
      return;
    }
    
    recentTasks.value.push(taskInfo.size);
    
    // Keep only the last WINDOW_SIZE tasks
    if (recentTasks.value.length > WINDOW_SIZE) {
      recentTasks.value = recentTasks.value.slice(-WINDOW_SIZE);
    }
  }
  
  function getCurrentTaskSizeDistribution(): Record<TaskSize, number> {
    if (recentTasks.value.length === 0) {
      return { big: 0, medium: 0, small: 0 };
    }
    
    const counts = { big: 0, medium: 0, small: 0 };
    
    for (const taskSize of recentTasks.value) {
      counts[taskSize]++;
    }
    
    const total = recentTasks.value.length;
    return {
      big: counts.big / total,
      medium: counts.medium / total,
      small: counts.small / total
    };
  }
  
  function getPreferredTaskSize(): TaskSize {
    const current = getCurrentTaskSizeDistribution();
    
    // Calculate how much each size is over/under target (in percentage points)
    const deviations: Array<{ size: TaskSize; deviation: number }> = [
      { size: 'big', deviation: TASK_SIZE_TARGETS.big - current.big },
      { size: 'medium', deviation: TASK_SIZE_TARGETS.medium - current.medium },
      { size: 'small', deviation: TASK_SIZE_TARGETS.small - current.small }
    ];
    
    // Sort by deviation (descending) - sizes that are most under-represented come first
    deviations.sort((a, b) => b.deviation - a.deviation);
    
    // Use weighted random selection based on sorted preference
    const sortedSizes = deviations.map(d => d.size);
    const selectedSize = pickRandomFromSortedList(sortedSizes);
    
    return selectedSize || 'small'; // fallback to small
  }
  
  function getTasksOfSize(taskSize: TaskSize): TaskName[] {
    const tasks: TaskName[] = [];
    
    for (const [taskName, taskInfo] of Object.entries(taskRegistry)) {
      if (taskInfo.size === taskSize) {
        tasks.push(taskName as TaskName);
      }
    }
    
    return tasks;
  }
  
  return {
    trackTask,
    getCurrentTaskSizeDistribution,
    getPreferredTaskSize,
    getTasksOfSize,
    recentTasks: recentTasks.value
  };
}