import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { getValidImmersionResource } from './getValidImmersionResource';
import { getRandomSeenVocabFromImmersionResource } from './getRandomVocabBasedOnImmersionResource';

export async function getRandomDueVocabFromRandomValidImmersionResource(
  resourceRepo: ResourceRepoContract,
  vocabRepo: VocabRepoContract,
  languageCodes: string[]
): Promise<VocabData | null> {
  try {
    const resource = await getValidImmersionResource(resourceRepo, languageCodes);
    if (!resource) return null;

    return await getRandomSeenVocabFromImmersionResource(resourceRepo, vocabRepo, resource.uid);
  } catch (error) {
    console.error('Error getting random due vocab from random valid immersion resource:', error);
    return null;
  }
}
