import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import { randomFromArray } from '@/shared/utils/arrayUtils';

async function getVocabFromImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  resourceUid: string,
  vocabBlockList?: string[]
): Promise<VocabData[] | null> {
  const resource = await resourceRepo.getResourceById(resourceUid);
  if (!resource?.isImmersionContent || resource.vocab.length === 0) {
    return null;
  }

  const vocabItems = await vocabRepo.getVocabByUIDs(resource.vocab);
  
  // Filter out blocked vocab
  const filteredVocab = vocabBlockList 
    ? vocabItems.filter(v => !vocabBlockList.includes(v.uid))
    : vocabItems;
    
  return filteredVocab.length > 0 ? filteredVocab : null;
}

export async function getRandomVocabBasedOnImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  resourceUid: string,
  vocabBlockList?: string[]
): Promise<VocabData | null> {
  try {
    const vocabItems = await getVocabFromImmersionResource(resourceRepo, vocabRepo, resourceUid, vocabBlockList);
    if (!vocabItems) return null;

    const newVocab = vocabItems.filter(v => v.progress.level === -1);
    const seenVocab = vocabItems.filter(v => v.progress.level >= 0);

    // Always allow new vocab since we removed the tracker
    const availableNew = newVocab;
    
    if (availableNew.length === 0 && seenVocab.length === 0) return null;
    if (availableNew.length === 0) return randomFromArray(seenVocab);
    if (seenVocab.length === 0) return randomFromArray(availableNew);

    return Math.random() < 0.3 ? randomFromArray(availableNew) : randomFromArray(seenVocab);
  } catch (error) {
    console.error('Error getting random vocab from immersion resource:', error);
    return null;
  }
}

export async function getRandomNewVocabFromImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  resourceUid: string,
  vocabBlockList?: string[]
): Promise<VocabData | null> {
  try {
    const vocabItems = await getVocabFromImmersionResource(resourceRepo, vocabRepo, resourceUid, vocabBlockList);
    if (!vocabItems) return null;

    const newVocab = vocabItems.filter(v => v.progress.level === -1);
    return randomFromArray(newVocab);
  } catch (error) {
    console.error('Error getting random new vocab from immersion resource:', error);
    return null;
  }
}

export async function getRandomSeenVocabFromImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  resourceUid: string,
  vocabBlockList?: string[]
): Promise<VocabData | null> {
  try {
    const vocabItems = await getVocabFromImmersionResource(resourceRepo, vocabRepo, resourceUid, vocabBlockList);
    if (!vocabItems) return null;

    const seenVocab = vocabItems.filter(v => v.progress.level >= 0);
    return randomFromArray(seenVocab);
  } catch (error) {
    console.error('Error getting random seen vocab from immersion resource:', error);
    return null;
  }
}