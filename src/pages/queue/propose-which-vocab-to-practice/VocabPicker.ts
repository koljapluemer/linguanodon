import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabProposerContract } from './VocabProposerContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { ProposerByDueVocab } from './proposers/ProposerByDueVocab';
import { ProposerByImmersionContentAlmostReady } from './proposers/ProposerByImmersionContentAlmostReady';
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
    const uniqueVocab = removeDuplicates(allProposals, vocab => vocab.id);
    const shuffled = shuffleArray(uniqueVocab);
    return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
  }

  setProposers(proposers: VocabProposerContract[]) {
    this.proposers = proposers;
  }

  initializeProposers(vocabRepo: VocabAndTranslationRepoContract, immersionRepo: ImmersionContentRepoContract) {
    const dueVocabProposer = new ProposerByDueVocab();
    dueVocabProposer.setVocabRepo(vocabRepo);

    const immersionProposer = new ProposerByImmersionContentAlmostReady();
    immersionProposer.setRepos(vocabRepo, immersionRepo);

    this.proposers = [dueVocabProposer, immersionProposer];
  }
}