import { ref } from 'vue';

// Global state to track sets used in the last lesson
const lastUsedSets = ref<string[]>([]);

export interface EntityWithOrigins {
  origins: string[];
}

export function useSetTracking() {
  
  /**
   * Records the sets that were used in the current lesson generation
   */
  function recordUsedSets(entities: EntityWithOrigins[]): void {
    const allUsedSets = new Set<string>();
    
    for (const entity of entities) {
      for (const origin of entity.origins) {
        allUsedSets.add(origin);
      }
    }
    
    lastUsedSets.value = Array.from(allUsedSets);
  }

  /**
   * Gets the currently tracked sets from the last lesson
   */
  function getLastUsedSets(): string[] {
    return [...lastUsedSets.value];
  }

  /**
   * Clears the tracked sets (useful for testing or reset scenarios)
   */
  function clearTrackedSets(): void {
    lastUsedSets.value = [];
  }

  return {
    recordUsedSets,
    getLastUsedSets,
    clearTrackedSets
  };
}