import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { pickRandom } from '@/shared/arrayUtils';

export class ProposerByGoals implements VocabProposerContract {
  constructor(
    private goalRepo?: GoalRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.goalRepo || !this.vocabRepo) {
      console.warn('Repositories not available for ProposerByGoals');
      return [];
    }

    try {
      // Get incomplete goals
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      
      if (incompleteGoals.length === 0) {
        return [];
      }

      // Randomly select a goal
      const selectedGoal = pickRandom(incompleteGoals, 1)[0];
      
      if (!selectedGoal || selectedGoal.vocab.length === 0) {
        return [];
      }

      // Get vocab from the selected goal
      const vocabPromises = selectedGoal.vocab.map(id => this.vocabRepo!.getVocabByUID(id));
      const vocabResults = await Promise.all(vocabPromises);
      const goalVocab = vocabResults.filter((v): v is VocabData => v !== undefined);

      if (goalVocab.length === 0) {
        return [];
      }

      // Select up to targetNumber vocab items randomly
      const selectedVocab = pickRandom(goalVocab, Math.min(targetNumber, goalVocab.length));
      return selectedVocab;
      
    } catch (error) {
      console.error('Error in ProposerByGoals:', error);
      return [];
    }
  }

  setRepos(goalRepo: GoalRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.goalRepo = goalRepo;
    this.vocabRepo = vocabRepo;
  }
}