import { ref } from 'vue';

const currentSessionTaskCount = ref(0);

export function useTrackTaskNumber() {
  function incrementTaskCount() {
    currentSessionTaskCount.value++;
  }

  function resetTaskCount() {
    currentSessionTaskCount.value = 0;
  }

  function getCurrentTaskCount(): number {
    return currentSessionTaskCount.value;
  }

  function isFirstTask(): boolean {
    return currentSessionTaskCount.value === 0;
  }

  return {
    incrementTaskCount,
    resetTaskCount,
    getCurrentTaskCount,
    isFirstTask
  };
}