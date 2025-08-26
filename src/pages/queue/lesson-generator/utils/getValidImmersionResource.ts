import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import { randomFromArray } from '@/shared/arrayUtils';

export async function getValidImmersionResource(
  resourceRepo: ResourceRepoContract,
  languageCodes: string[]
): Promise<ResourceData | null> {
  try {
    const validResources = await resourceRepo.getValidImmersionResources(languageCodes);
    return randomFromArray(validResources);
  } catch (error) {
    console.error('Error getting valid immersion resource:', error);
    return null;
  }
}
