import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { randomFromArray } from '@/shared/utils/arrayUtils';
import { getRandomNewVocabFromImmersionResource } from './getRandomVocabBasedOnImmersionResource';

export async function getRandomNewVocabFromRandomValidImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<VocabData | null> {
  try {
    const resources = await resourceRepo.getValidImmersionResources(languageCodes);
    if (resources.length === 0) return null;
    
    const resource = randomFromArray(resources);
    if (!resource) return null;

    return await getRandomNewVocabFromImmersionResource(resourceRepo, vocabRepo, resource.uid, vocabBlockList);
  } catch (error) {
    console.error('Error getting random new vocab from random valid immersion resource:', error);
    return null;
  }
}
