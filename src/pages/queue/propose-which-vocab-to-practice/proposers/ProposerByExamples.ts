import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import { pickRandom } from '@/shared/arrayUtils';

// Configuration
const TOP_OF_MIND_THRESHOLD = 0.8; // 80% top-of-mind threshold

export class ProposerByExamples implements VocabProposerContract {
  constructor(
    private exampleRepo?: ExampleRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.exampleRepo || !this.vocabRepo) {
      console.warn('Repos not available for ProposerByExamples');
      return [];
    }

    try {
      // Get examples eligible for vocab practice
      const eligibleExamples = await this.exampleRepo.getExamplesForVocabPractice();
      
      if (eligibleExamples.length === 0) {
        console.info('ProposerByExamples: No eligible examples found');
        return [];
      }

      // Filter examples where less than 80% of vocab is top-of-mind
      const needyExamples = [];
      
      for (const example of eligibleExamples) {
        if (example.associatedVocab.length === 0) {
          continue; // Skip examples with no associated vocab
        }
        
        // Calculate top-of-mind percentage for this example
        let topOfMindCount = 0;
        const totalCount = example.associatedVocab.length;
        
        for (const vocabId of example.associatedVocab) {
          const vocab = await this.vocabRepo.getVocabByUID(vocabId);
          if (vocab && isCurrentlyTopOfMind(vocab)) {
            topOfMindCount++;
          }
        }
        
        const percentage = topOfMindCount / totalCount;
        
        // Only consider examples with less than 80% top-of-mind vocab
        if (percentage < TOP_OF_MIND_THRESHOLD) {
          needyExamples.push(example);
        }
      }
      
      if (needyExamples.length === 0) {
        console.info('ProposerByExamples: No examples need vocab practice');
        return [];
      }
      
      // Randomly select one needy example
      const selectedExample = pickRandom(needyExamples, 1)[0];
      
      console.info(`ProposerByExamples: Chose example "${selectedExample.content || selectedExample.id}" for vocab practice`);
      
      // Get all due vocab units from the selected example
      const vocabToTrain: VocabData[] = [];
      const now = new Date();
      
      for (const vocabId of selectedExample.associatedVocab) {
        const vocab = await this.vocabRepo.getVocabByUID(vocabId);
        if (vocab && !vocab.doNotPractice) {
          // Include vocab that is due for practice OR is new (never practiced)
          const isDue = vocab.progress.due <= now;
          const isNew = vocab.progress.reps === 0;
          if (isDue || isNew) {
            vocabToTrain.push(vocab);
          }
        }
      }

      // Return up to target number of vocab items
      const result = vocabToTrain.slice(0, Math.min(targetNumber, vocabToTrain.length));
      console.info(`ProposerByExamples: Proposed ${result.length} vocab items from example`);
      
      return result;
    } catch (error) {
      console.error('Error proposing vocab from examples:', error);
      return [];
    }
  }

  setRepos(exampleRepo: ExampleRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.exampleRepo = exampleRepo;
    this.vocabRepo = vocabRepo;
  }
}