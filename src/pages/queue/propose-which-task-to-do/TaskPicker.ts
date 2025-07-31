import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import { TASK_REGISTRY } from './TaskRegistry';
import { pickRandom } from '@/shared/arrayUtils';

export class TaskPicker {
  private initialized = false;
  
  initializeProposers(vocabRepo: VocabAndTranslationRepoContract, immersionRepo: ImmersionContentRepoContract, exampleRepo: ExampleRepoContract, goalRepo: GoalRepoContract, resourceRepo: ResourceRepoContract) {
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

    // Configure goal proposers
    const addSubGoalsProposer = TASK_REGISTRY['add-sub-goals'].proposer as { setGoalRepo?: (repo: GoalRepoContract) => void };
    if (addSubGoalsProposer.setGoalRepo) {
      addSubGoalsProposer.setGoalRepo(goalRepo);
    }
    
    const addVocabToGoalProposer = TASK_REGISTRY['add-vocab-to-goal'].proposer as { setGoalRepo?: (repo: GoalRepoContract) => void };
    if (addVocabToGoalProposer.setGoalRepo) {
      addVocabToGoalProposer.setGoalRepo(goalRepo);
    }
    
    const addExamplesToGoalProposer = TASK_REGISTRY['add-examples-to-goal'].proposer as { setGoalRepo?: (repo: GoalRepoContract) => void };
    if (addExamplesToGoalProposer.setGoalRepo) {
      addExamplesToGoalProposer.setGoalRepo(goalRepo);
    }
    
    const addMilestonesProposer = TASK_REGISTRY['add-milestones'].proposer as { setGoalRepo?: (repo: GoalRepoContract) => void };
    if (addMilestonesProposer.setGoalRepo) {
      addMilestonesProposer.setGoalRepo(goalRepo);
    }
    
    const resourceProposer = TASK_REGISTRY['resource'].proposer as { setResourceRepo?: (repo: ResourceRepoContract) => void };
    if (resourceProposer.setResourceRepo) {
      resourceProposer.setResourceRepo(resourceRepo);
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