import { ref } from 'vue';

const usedVocabUids = ref<string[]>([]);

export function useUsedVocabTracker() {
  const addUsedVocab = (uid: string) => {
    usedVocabUids.value.push(uid);
  };

  const getLastUsedVocabUid = (): string | null => {
    return usedVocabUids.value.length > 0 ? usedVocabUids.value[usedVocabUids.value.length - 1] : null;
  };

  return {
    addUsedVocab,
    getLastUsedVocabUid
  };
}
