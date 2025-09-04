import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';
import { getRandomGeneratedTaskForVocab } from '@/pages/practice/modes/utils/getRandomGeneratedTaskForVocab';
import { generateGuessWhatSentenceMeans } from '@/pages/practice/tasks/task-guess-what-sentence-means/generate';

interface SentenceSlideState {
  currentSentence: VocabData | null;
  connectedVocabQueue: VocabData[];
  initialConnectedVocabCount: number;
  phase: 'vocab-tasks' | 'sentence-meaning';
}

// Global state for the sentence slide mode
let slideState: SentenceSlideState = {
  currentSentence: null,
  connectedVocabQueue: [],
  initialConnectedVocabCount: 0,
  phase: 'vocab-tasks'
};

export async function generateSentenceSlideTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<Task | null> {
  try {
    console.log('[SentenceSlide] generateSentenceSlideTask called with:', { 
      languageCodes, 
      blockList, 
      currentSentence: slideState.currentSentence?.uid,
      phase: slideState.phase 
    });
    
    // If we don't have a current sentence or need to pick a new one
    if (!slideState.currentSentence) {
      ;
      const sentence = await getRandomUnseenSentenceWithRelatedVocab(
        vocabRepo,
        languageCodes,
        blockList
      );
      
      console.log('[SentenceSlide] Found sentence:', sentence ? 
        { uid: sentence.uid, content: sentence.content, relatedVocabCount: sentence.relatedVocab?.length } : 
        'null'
      );
      
      if (!sentence) {
        ;
        return null;
      }
      
      slideState.currentSentence = sentence;
      await initializeConnectedVocabQueue(sentence, vocabRepo);
      slideState.phase = 'vocab-tasks';
      ;
    }
    
    // Phase 1: Work through connected vocabulary
    if (slideState.phase === 'vocab-tasks') {
      ;
      const task = await getNextVocabTask(vocabRepo, translationRepo);
      if (task) {
        ;
        return task;
      }
      
      ;
      // All connected vocab done, move to sentence meaning task
      slideState.phase = 'sentence-meaning';
    }
    
    // Phase 2: Show sentence meaning guess task
    if (slideState.phase === 'sentence-meaning') {
      ;
      if (slideState.currentSentence) {
        const task = generateGuessWhatSentenceMeans(slideState.currentSentence);
        ;
        // Reset state for next sentence
        resetSlideState();
        return task;
      }
    }
    
    // Fallback - reset and try again
    ;
    resetSlideState();
    return null;
    
  } catch (error) {
    console.error('Error generating sentence slide task:', error);
    resetSlideState();
    return null;
  }
}

async function getRandomUnseenSentenceWithRelatedVocab(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<VocabData | null> {
  try {
    // Use the new repo method that does DB-level filtering
    return await vocabRepo.getRandomUnseenSentenceVocabWithRelatedVocab(languageCodes, blockList);
  } catch (error) {
    console.error('Error getting random unseen sentence:', error);
    return null;
  }
}

async function initializeConnectedVocabQueue(
  sentence: VocabData,
  vocabRepo: VocabRepoContract
): Promise<void> {
  try {
    // Get all related vocab (direct relatedVocab references only)
    const relatedVocabIds = sentence.relatedVocab || [];
    const connectedVocab = await vocabRepo.getVocabByUIDs(relatedVocabIds);
    
    // Track the initial list
    slideState.connectedVocabQueue = [...connectedVocab];
    slideState.initialConnectedVocabCount = connectedVocab.length;
  } catch (error) {
    console.error('Error initializing connected vocab queue:', error);
    slideState.connectedVocabQueue = [];
    slideState.initialConnectedVocabCount = 0;
  }
}

async function getNextVocabTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract
): Promise<Task | null> {
  try {
    // Check if we have any connected vocab left
    if (slideState.connectedVocabQueue.length === 0) {
      return null;
    }
    
    // Pick random vocab from connected list
    const randomIndex = Math.floor(Math.random() * slideState.connectedVocabQueue.length);
    const vocab = slideState.connectedVocabQueue[randomIndex];
    
    // Generate task for this vocab
    const translations = await translationRepo.getTranslationsByIds(vocab.translations || []);
    const task = await getRandomGeneratedTaskForVocab(vocab, translations, vocabRepo);
    
    if (!task) {
      // If we couldn't generate a task, remove this vocab from queue and try again
      slideState.connectedVocabQueue.splice(randomIndex, 1);
      return getNextVocabTask(vocabRepo, translationRepo);
    }
    
    // After task completion, we need to check if vocab is still due
    // This will be handled by the completion logic in the widget
    
    return task;
  } catch (error) {
    console.error('Error getting next vocab task:', error);
    return null;
  }
}

export async function removeVocabIfNotDue(
  vocabId: string,
  vocabRepo: VocabRepoContract
): Promise<void> {
  try {
    // Get fresh vocab data to check due status
    const vocab = await vocabRepo.getVocabByUID(vocabId);
    if (!vocab) return;
    
    // Check if vocab is still due
    const now = new Date();
    const dueDate = vocab.progress.due;
    const isStillDue = dueDate && dueDate <= now;
    
    if (!isStillDue) {
      // Remove from connected vocab queue
      slideState.connectedVocabQueue = slideState.connectedVocabQueue.filter(v => v.uid !== vocabId);
    }
  } catch (error) {
    console.error('Error checking vocab due status:', error);
  }
}

function resetSlideState(): void {
  slideState = {
    currentSentence: null,
    connectedVocabQueue: [],
    initialConnectedVocabCount: 0,
    phase: 'vocab-tasks'
  };
}

// Export function to get current progress
export function getSentenceSlideProgress(): {
  totalInitialConnectedVocab: number;
  remainingConnectedVocab: number;
  progressPercentage: number;
  currentSentence: string;
  phaseDescription: string;
} {
  const { 
    currentSentence, 
    connectedVocabQueue, 
    initialConnectedVocabCount, 
    phase 
  } = slideState;
  
  const remainingConnectedVocab = connectedVocabQueue.length;
  const completedConnectedVocab = initialConnectedVocabCount - remainingConnectedVocab;
  
  // Progress percentage based on completed connected vocab
  const progressPercentage = initialConnectedVocabCount > 0 
    ? (completedConnectedVocab / initialConnectedVocabCount) * 100 
    : 0;
  
  let phaseDescription = '';
  if (phase === 'vocab-tasks') {
    phaseDescription = `Working through connected vocabulary (${completedConnectedVocab}/${initialConnectedVocabCount})`;
  } else if (phase === 'sentence-meaning') {
    phaseDescription = 'Ready to guess sentence meaning';
  }
  
  return {
    totalInitialConnectedVocab: initialConnectedVocabCount,
    remainingConnectedVocab,
    progressPercentage,
    currentSentence: currentSentence?.content || '',
    phaseDescription
  };
}