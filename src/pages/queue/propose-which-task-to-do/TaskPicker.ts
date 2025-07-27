import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import { TASK_REGISTRY } from './TaskRegistry';
import { pickRandom } from '@/shared/arrayUtils';

export class TaskPicker {
  private initialized = false;
  
  initializeProposers(vocabRepo: VocabAndTranslationRepoContract, immersionRepo: ImmersionContentRepoContract, exampleRepo: ExampleRepoContract) {
    // Configure proposers with repositories
    const addPronunciationProposer = TASK_REGISTRY['add-pronunciation'].proposer as { setVocabRepo?: (repo: VocabAndTranslationRepoContract) => void };
    if (addPronunciationProposer.setVocabRepo) {
      addPronunciationProposer.setVocabRepo(vocabRepo);
    }
    
    const immersionContentProposer = TASK_REGISTRY['immersion-content'].proposer;
    if ('setRepos' in immersionContentProposer && typeof immersionContentProposer.setRepos === 'function') {
      immersionContentProposer.setRepos(immersionRepo, vocabRepo);
    }
    
    const freeTranslateProposer = TASK_REGISTRY['free-translate'].proposer;
    if ('setRepos' in freeTranslateProposer && typeof freeTranslateProposer.setRepos === 'function') {
      freeTranslateProposer.setRepos(exampleRepo, vocabRepo);
    }
    
    this.initialized = true;
  }
  
  async pickTask(): Promise<RuntimeTask | null> {
    if (!this.initialized) {
      console.warn('TaskPicker not initialized with repositories');
      return null;
    }
    const proposers = Object.values(TASK_REGISTRY).map(def => def.proposer);
    const proposals: RuntimeTask[] = [];
    
    // Collect proposals from all proposers
    for (const proposer of proposers) {
      try {
        const proposal = await proposer.proposeTask();
        if (proposal) {
          proposals.push(proposal);
        }
      } catch (error) {
        console.error('Error getting task proposal:', error);
      }
    }
    
    if (proposals.length === 0) {
      console.warn('No tasks available');
      return null;
    }
    
    // Randomly select one proposal
    return pickRandom(proposals, 1)[0];
  }
}