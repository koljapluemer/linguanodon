import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';

export class ProposerByImmersionContentAlmostReady implements VocabProposerContract {
  constructor(
    private vocabRepo?: VocabAndTranslationRepoContract,
    private resourceRepo?: ResourceRepoContract
  ) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.vocabRepo || !this.resourceRepo) {
      console.warn('Repos not available for ProposerByImmersionContentAlmostReady');
      return [];
    }

    try {
      // Get all resources that are immersion content
      const allResources = await this.resourceRepo.getAllResources();
      const allContent = allResources.filter(resource => resource.isImmersionContent);
      
      let bestContent = null;
      let bestPercentage = -1;
      
      // Find the immersion content with the highest top-of-mind percentage below 90%
      for (const content of allContent) {
        if (content.extractedVocab.length === 0) {
          continue; // Skip content with no associated vocab
        }
        
        // Calculate top-of-mind percentage for this content
        let topOfMindCount = 0;
        const totalCount = content.extractedVocab.length;
        
        for (const vocabId of content.extractedVocab) {
          const vocab = await this.vocabRepo.getVocabByUID(vocabId);
          if (vocab && isCurrentlyTopOfMind(vocab)) {
            topOfMindCount++;
          }
        }
        
        const percentage = topOfMindCount / totalCount;
        
        // Only consider content with percentage below 90% and higher than current best
        if (percentage < 0.9 && percentage > bestPercentage) {
          bestContent = content;
          bestPercentage = percentage;
        }
      }
      
      if (!bestContent) {
        return [];
      }
      
      // Get vocab units associated with the best content that are due or new
      const vocabToTrain: VocabData[] = [];
      const now = new Date();
      
      for (const vocabId of bestContent.extractedVocab) {
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

      // Shuffle and return up to target number
      const shuffled = shuffleArray(vocabToTrain);
      return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
    } catch (error) {
      console.error('Error proposing vocab from immersion content:', error);
      return [];
    }
  }

  setRepos(vocabRepo: VocabAndTranslationRepoContract, resourceRepo: ResourceRepoContract) {
    this.vocabRepo = vocabRepo;
    this.resourceRepo = resourceRepo;
  }
}