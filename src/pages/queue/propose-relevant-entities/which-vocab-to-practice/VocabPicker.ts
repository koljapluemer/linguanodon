import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabProposerContract } from './VocabProposerContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import { ProposerByAlreadySeenDueVocab } from './proposers/ProposerByAlreadySeenDueVocab';
import { ProposerOfNewVocab } from './proposers/ProposerOfNewVocab';
import { ProposerByGoals } from './proposers/ProposerByGoals';
import { randomBetween, shuffleArray, removeDuplicates } from '@/shared/arrayUtils';

export class VocabPicker {
  private proposers: VocabProposerContract[] = [];

  async pickVocabBatch(): Promise<VocabData[]> {
    // Random target between 5 and 20
    const targetNumber = randomBetween(5, 20);
    
    const allProposals: VocabData[] = [];
    
    // Collect proposals from all proposers
    for (const proposer of this.proposers) {
      try {
        const proposals = await proposer.proposeVocab(targetNumber);
        allProposals.push(...proposals);
      } catch (error) {
        console.error('Error getting vocab proposals:', error);
      }
    }
    
    if (allProposals.length === 0) {
      console.warn('No vocab available');
      return [];
    }
    
    // Remove duplicates, shuffle, and limit to target number
    const uniqueVocab = removeDuplicates(allProposals, vocab => vocab.uid);
    const shuffled = shuffleArray(uniqueVocab);
    return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
  }

  setProposers(proposers: VocabProposerContract[]) {
    this.proposers = proposers;
  }

  initializeProposers(vocabRepo: VocabAndTranslationRepoContract, goalRepo?: GoalRepoContract) {
    const alreadySeenDueProposer = new ProposerByAlreadySeenDueVocab();
    alreadySeenDueProposer.setVocabRepo(vocabRepo);

    const newVocabProposer = new ProposerOfNewVocab();
    newVocabProposer.setVocabRepo(vocabRepo);

    this.proposers = [alreadySeenDueProposer, newVocabProposer];

    // Add goals proposer if goalRepo is available
    if (goalRepo) {
      const goalsProposer = new ProposerByGoals();
      goalsProposer.setRepos(goalRepo, vocabRepo);
      this.proposers.push(goalsProposer);
    }
  }
}