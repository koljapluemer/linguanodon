import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import { pickRandom } from '@/shared/arrayUtils';

// Configuration
const TOP_OF_MIND_THRESHOLD = 0.6; // 60% of associated vocab must be top-of-mind

export class ProposeFreeTranslate implements TaskProposerContract {
  constructor(
    private exampleRepo?: ExampleRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.exampleRepo || !this.vocabRepo) {
      console.warn('Required repos not available for ProposeFreeTranslate');
      return null;
    }

    try {
      // Get examples eligible for free-translate tasks
      const eligibleExamples = await this.exampleRepo.getExamplesForFreeTranslate();
      
      if (eligibleExamples.length === 0) {
        return null;
      }

      // Filter examples by vocab readiness threshold
      const readyExamples = [];
      
      for (const example of eligibleExamples) {
        if (example.associatedVocab.length === 0) {
          // No associated vocab - consider it ready
          readyExamples.push(example);
          continue;
        }
        
        // Check what percentage of associated vocab is top-of-mind
        let topOfMindCount = 0;
        const totalCount = example.associatedVocab.length;
        
        for (const vocabId of example.associatedVocab) {
          const vocab = await this.vocabRepo.getVocabByUID(vocabId);
          if (vocab && isCurrentlyTopOfMind(vocab)) {
            topOfMindCount++;
          }
        }
        
        const readinessPercentage = topOfMindCount / totalCount;
        
        // If at least 60% of vocab is top-of-mind, this example is ready
        if (readinessPercentage >= TOP_OF_MIND_THRESHOLD) {
          readyExamples.push(example);
        }
      }
      
      if (readyExamples.length === 0) {
        return null;
      }
      
      // Randomly select one ready example
      const selectedExample = pickRandom(readyExamples, 1)[0];
      
      
      return {
        taskType: 'free-translate',
        data: {
          exampleId: selectedExample.id,
          example: selectedExample
        }
      };
    } catch (error) {
      console.error('Error proposing free-translate task:', error);
      return null;
    }
  }

  setRepos(exampleRepo: ExampleRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.exampleRepo = exampleRepo;
    this.vocabRepo = vocabRepo;
  }
}