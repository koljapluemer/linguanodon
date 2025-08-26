import { ref } from 'vue';

// Track all tasks as arrays of vocab UIDs (infinite history)
const allTasks = ref<string[][]>([]);

export function useTrackUsedVocab() {
  const trackVocabUsed = (vocabUids: string[]) => {
    if (vocabUids.length === 0) return;
    
    // Add the current task's vocab to the infinite history
    allTasks.value.push([...vocabUids]);
  };

  const getAllUsedVocab = (): string[] => {
    // Flatten all vocab from all tasks into a single array
    const allVocab = allTasks.value.flat();
    // Remove duplicates
    return [...new Set(allVocab)];
  };

  const getLastNTasksVocab = (n: number): string[] => {
    // Get vocab from the last N tasks
    const lastNTasks = allTasks.value.slice(-n);
    const vocabFromLastNTasks = lastNTasks.flat();
    // Remove duplicates
    return [...new Set(vocabFromLastNTasks)];
  };

  const getRecentlyUsedVocab = (): string[] => {
    // Get vocab from the last 3 tasks for backwards compatibility
    return getLastNTasksVocab(3);
  };

  const clearHistory = () => {
    allTasks.value = [];
  };

  return {
    trackVocabUsed,
    getAllUsedVocab,
    getLastNTasksVocab,
    getRecentlyUsedVocab,
    clearHistory
  };
}