import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { getTaskBasedOnVocab } from './getTaskBasedOnVocab';
import { useTrackTaskNumber } from './useTrackTaskNumber';
import { useNewVocabTracker } from './useNewVocabTracker';
import { pickRandom } from '@/shared/arrayUtils';

export async function makeTaskWithFocusOnVocab(
  focusVocabUid: string,
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  noteRepo: NoteRepoContract,
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    const { isFirstTask } = useTrackTaskNumber();
    const { canGenerateNewVocabTask } = useNewVocabTracker();
    
    // If it's the first task of the session, always use the focused vocab
    if (isFirstTask()) {
      return await getTaskBasedOnVocab(focusVocabUid, vocabRepo, translationRepo, noteRepo);
    }
    
    // For subsequent tasks, get the focused vocab and its related vocab
    const focusVocab = await vocabRepo.getVocabByUID(focusVocabUid);
    if (!focusVocab) {
      console.warn(`Focus vocab not found: ${focusVocabUid}`);
      return null;
    }
    
    // For sentence vocab, prioritize related vocab first, then the sentence itself
    // For word/unspecified vocab, keep the original behavior (include focus vocab in candidates)
    let potentialVocabUids: string[];
    
    if (focusVocab.length === 'sentence') {
      // For sentences: try related vocab first, only use sentence if no related vocab available
      potentialVocabUids = focusVocab.relatedVocab.length > 0 ? focusVocab.relatedVocab : [focusVocabUid];
    } else {
      // For word/unspecified: include focus vocab with related vocab (original behavior)
      potentialVocabUids = [focusVocabUid, ...focusVocab.relatedVocab];
    }
    
    // Get vocab data for all potential candidates
    const allPotentialVocab = await vocabRepo.getVocabByUIDs(potentialVocabUids);
    
    // Filter to only due or new vocab that we're allowed to generate tasks for
    const candidateVocab = [];
    
    for (const vocab of allPotentialVocab) {
      // Skip if vocab is marked as do not practice
      if (vocab.doNotPractice) continue;
      
      // Skip if vocab is in the block list
      if (vocabBlockList && vocabBlockList.includes(vocab.uid)) continue;
      
      const vocabIsDue = vocab.progress.level >= 0 && vocab.progress.due && new Date(vocab.progress.due) <= new Date();
      const vocabIsUnseen = vocab.progress.level === -1;
      
      // If it's new vocab, check if we're allowed to generate new vocab tasks
      if (vocabIsUnseen && !canGenerateNewVocabTask()) continue;
      
      // Include vocab if it's due or new (and we're allowed)
      if (vocabIsDue || vocabIsUnseen) {
        candidateVocab.push(vocab);
      }
    }
    
    // For sentence vocab: if no related vocab candidates found, try the sentence itself
    if (candidateVocab.length === 0 && focusVocab.length === 'sentence') {
      const focusVocabIsDue = focusVocab.progress.level >= 0 && focusVocab.progress.due && new Date(focusVocab.progress.due) <= new Date();
      const focusVocabIsUnseen = focusVocab.progress.level === -1;
      
      // Check if focus sentence vocab is valid
      if (!focusVocab.doNotPractice && 
          (!vocabBlockList || !vocabBlockList.includes(focusVocab.uid)) &&
          (focusVocabIsDue || (focusVocabIsUnseen && canGenerateNewVocabTask()))) {
        candidateVocab.push(focusVocab);
      }
    }
    
    // If no valid candidates, return null to fall back to standard generation
    if (candidateVocab.length === 0) {
      console.log('No valid candidate vocab found for focused task generation');
      return null;
    }
    
    // Pick a random vocab from candidates
    const selectedVocab = pickRandom(candidateVocab, 1)[0];
    
    // Generate task based on selected vocab
    return await getTaskBasedOnVocab(selectedVocab.uid, vocabRepo, translationRepo, noteRepo);
    
  } catch (error) {
    console.error('Error in makeTaskWithFocusOnVocab:', error);
    return null;
  }
}