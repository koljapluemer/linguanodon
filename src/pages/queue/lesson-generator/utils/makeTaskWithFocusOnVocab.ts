import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { getTaskBasedOnVocab } from './getTaskBasedOnVocab';
import { useTrackTaskNumber } from './useTrackTaskNumber';
import { useNewVocabTracker } from './useNewVocabTracker';
import { pickRandom } from '@/shared/arrayUtils';
import { isDue, isUnseen } from '@/entities/vocab/vocabUtils';

export async function makeTaskWithFocusOnVocab(
  focusVocabUid: string,
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  noteRepo: NoteRepoContract
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
    
    // Get all related vocab uids
    const allPotentialVocabUids = [focusVocabUid, ...focusVocab.relatedVocab];
    
    // Get vocab data for all potential candidates
    const allPotentialVocab = await vocabRepo.getVocabByUIDs(allPotentialVocabUids);
    
    // Filter to only due or new vocab that we're allowed to generate tasks for
    const candidateVocab = [];
    
    for (const vocab of allPotentialVocab) {
      // Skip if vocab is marked as do not practice
      if (vocab.doNotPractice) continue;
      
      const vocabIsDue = isDue(vocab);
      const vocabIsUnseen = isUnseen(vocab);
      
      // If it's new vocab, check if we're allowed to generate new vocab tasks
      if (vocabIsUnseen && !canGenerateNewVocabTask()) continue;
      
      // Include vocab if it's due or new (and we're allowed)
      if (vocabIsDue || vocabIsUnseen) {
        candidateVocab.push(vocab);
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