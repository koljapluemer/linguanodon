import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { Task } from '@/pages/practice/Task';
import { getRandomGeneratedTaskForVocab } from '@/pages/practice/modes/utils/getRandomGeneratedTaskForVocab';
import { getRandomGeneratedTaskForFactCard } from '@/pages/practice/modes/utils/getRandomGeneratedTaskForFactCard';
import { generateConsumeImmersionContent } from '@/pages/practice/tasks/task-consume-immersion-content/generate';
import { shuffleArray, randomFromArray } from '@/shared/utils/arrayUtils';

interface IllegalImmersionState {
  currentResource: ResourceData | null;
  vocabQueue: VocabData[];
  factCardQueue: FactCardData[];
  dueVocabQueue: VocabData[];
  dueFactCardQueue: FactCardData[];
  phase: 'initial-round' | 'due-round' | 'consume-content';
}

// Global state for the illegal immersion mode
let immersionState: IllegalImmersionState = {
  currentResource: null,
  vocabQueue: [],
  factCardQueue: [],
  dueVocabQueue: [],
  dueFactCardQueue: [],
  phase: 'initial-round'
};

export async function generateIllegalImmersionTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  factCardRepo: FactCardRepoContract,
  resourceRepo: ResourceRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<Task | null> {
  try {
    // If we don't have a current resource or need to pick a new one
    if (!immersionState.currentResource) {
      const resources = await resourceRepo.getValidImmersionResources(languageCodes);
      if (resources.length === 0) {
        return null;
      }
      
      // Filter out blocked resources
      const availableResources = blockList ? 
        resources.filter(r => !blockList.includes(r.uid)) : resources;
      
      if (availableResources.length === 0) {
        return null;
      }
      
      // Pick a random resource
      immersionState.currentResource = randomFromArray(availableResources);
      if (!immersionState.currentResource) {
        return null;
      }
      
      // Initialize queues for this resource
      await initializeQueuesForResource(
        immersionState.currentResource,
        vocabRepo,
        factCardRepo
      );
      
      immersionState.phase = 'initial-round';
    }
    
    // Phase 1: Initial round - go through all vocab and fact cards at least once
    if (immersionState.phase === 'initial-round') {
      const task = await getNextInitialRoundTask(vocabRepo, translationRepo, factCardRepo);
      if (task) {
        return task;
      }
      
      // Initial round complete, move to due round
      immersionState.phase = 'due-round';
      await refreshDueQueues(immersionState.currentResource, vocabRepo, factCardRepo);
    }
    
    // Phase 2: Due round - only due content
    if (immersionState.phase === 'due-round') {
      const task = await getNextDueRoundTask(vocabRepo, translationRepo, factCardRepo);
      if (task) {
        return task;
      }
      
      // Due round complete, move to consume content
      immersionState.phase = 'consume-content';
    }
    
    // Phase 3: Consume content
    if (immersionState.phase === 'consume-content') {
      if (immersionState.currentResource) {
        const task = generateConsumeImmersionContent(immersionState.currentResource);
        // Reset state for next resource
        resetImmersionState();
        return task;
      }
    }
    
    // Fallback - reset and try again
    resetImmersionState();
    return null;
    
  } catch (error) {
    console.error('Error generating illegal immersion task:', error);
    resetImmersionState();
    return null;
  }
}

async function initializeQueuesForResource(
  resource: ResourceData,
  vocabRepo: VocabRepoContract,
  factCardRepo: FactCardRepoContract
): Promise<void> {
  // Get all vocab and fact cards for this resource
  const [vocabList, factCardList] = await Promise.all([
    vocabRepo.getVocabByUIDs(resource.vocab),
    factCardRepo.getFactCardsByUIDs(resource.factCards)
  ]);
  
  // Shuffle the arrays
  immersionState.vocabQueue = shuffleArray(vocabList);
  immersionState.factCardQueue = shuffleArray(factCardList);
  immersionState.dueVocabQueue = [];
  immersionState.dueFactCardQueue = [];
}

async function getNextInitialRoundTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  _factCardRepo: FactCardRepoContract
): Promise<Task | null> {
  // Check if we have any content left in initial queues
  if (immersionState.vocabQueue.length === 0 && immersionState.factCardQueue.length === 0) {
    return null;
  }
  
  // Randomly decide between vocab and fact cards
  const useVocab = immersionState.vocabQueue.length > 0 && 
    (immersionState.factCardQueue.length === 0 || Math.random() < 0.5);
  
  if (useVocab && immersionState.vocabQueue.length > 0) {
    const vocab = immersionState.vocabQueue.shift()!;
    const translations = await translationRepo.getTranslationsByIds(vocab.translations || []);
    return await getRandomGeneratedTaskForVocab(vocab, translations, vocabRepo);
  } else if (immersionState.factCardQueue.length > 0) {
    const factCard = immersionState.factCardQueue.shift()!;
    return await getRandomGeneratedTaskForFactCard(factCard);
  }
  
  return null;
}

async function refreshDueQueues(
  resource: ResourceData,
  vocabRepo: VocabRepoContract,
  factCardRepo: FactCardRepoContract
): Promise<void> {
  // Get all vocab and fact cards for this resource and check which are due
  const [allVocab, allFactCards] = await Promise.all([
    vocabRepo.getVocabByUIDs(resource.vocab),
    factCardRepo.getFactCardsByUIDs(resource.factCards)
  ]);
  
  // Filter for due content
  const now = new Date();
  const dueVocab = allVocab.filter(vocab => {
    const dueDate = vocab.progress.due;
    return dueDate && dueDate <= now;
  });
  
  const dueFactCards = allFactCards.filter(factCard => {
    const dueDate = factCard.progress.due;
    return dueDate && dueDate <= now;
  });
  
  // Shuffle the due content
  immersionState.dueVocabQueue = shuffleArray(dueVocab);
  immersionState.dueFactCardQueue = shuffleArray(dueFactCards);
}

async function getNextDueRoundTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  _factCardRepo: FactCardRepoContract
): Promise<Task | null> {
  // Check if we have any due content left
  if (immersionState.dueVocabQueue.length === 0 && immersionState.dueFactCardQueue.length === 0) {
    return null;
  }
  
  // Randomly decide between vocab and fact cards
  const useVocab = immersionState.dueVocabQueue.length > 0 && 
    (immersionState.dueFactCardQueue.length === 0 || Math.random() < 0.5);
  
  if (useVocab && immersionState.dueVocabQueue.length > 0) {
    const vocab = immersionState.dueVocabQueue.shift()!;
    const translations = await translationRepo.getTranslationsByIds(vocab.translations || []);
    return await getRandomGeneratedTaskForVocab(vocab, translations, vocabRepo);
  } else if (immersionState.dueFactCardQueue.length > 0) {
    const factCard = immersionState.dueFactCardQueue.shift()!;
    return await getRandomGeneratedTaskForFactCard(factCard);
  }
  
  return null;
}

function resetImmersionState(): void {
  immersionState = {
    currentResource: null,
    vocabQueue: [],
    factCardQueue: [],
    dueVocabQueue: [],
    dueFactCardQueue: [],
    phase: 'initial-round'
  };
}
