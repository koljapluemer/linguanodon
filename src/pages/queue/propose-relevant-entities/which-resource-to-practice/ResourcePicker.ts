import type { ResourceData } from '@/entities/resources/ResourceData';
import type { ResourceProposerContract } from './ResourcePickerContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { ProposerByOldestShownResource } from './proposers/ProposerByOldestShownResource';
import { ProposerByNewResource } from './proposers/ProposerByNewResource';
import { randomBetween, shuffleArray, removeDuplicates } from '@/shared/arrayUtils';

export class ResourcePicker {
  private proposers: ResourceProposerContract[] = [];

  async pickResourceBatch(): Promise<ResourceData[]> {
    const targetNumber = randomBetween(0, 2);
    
    if (targetNumber === 0) {
      return [];
    }
    
    const allProposals: ResourceData[] = [];
    
    for (const proposer of this.proposers) {
      try {
        const proposals = await proposer.proposeResources(targetNumber);
        allProposals.push(...proposals);
      } catch (error) {
        console.error('Error getting resource proposals:', error);
      }
    }
    
    if (allProposals.length === 0) {
      return [];
    }
    
    const uniqueResources = removeDuplicates(allProposals, resource => resource.uid);
    const shuffled = shuffleArray(uniqueResources);
    return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
  }

  setProposers(proposers: ResourceProposerContract[]) {
    this.proposers = proposers;
  }

  initializeProposers(
    resourceRepo: ResourceRepoContract, 
    languageRepo: LanguageRepoContract, 
    taskRepo: TaskRepoContract
  ) {
    const oldestShownProposer = new ProposerByOldestShownResource();
    oldestShownProposer.setRepos(resourceRepo, languageRepo, taskRepo);

    const newResourceProposer = new ProposerByNewResource();
    newResourceProposer.setRepos(resourceRepo, languageRepo, taskRepo);

    this.proposers = [oldestShownProposer, newResourceProposer];
  }
}