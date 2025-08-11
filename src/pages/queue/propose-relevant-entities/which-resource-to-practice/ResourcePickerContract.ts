import type { ResourceData } from '@/entities/resources/ResourceData';

export interface ResourceProposerContract {
  proposeResources(targetNumber: number): Promise<ResourceData[]>;
}