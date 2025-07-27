import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';

export class ProposeImmersionContent implements TaskProposerContract {
  constructor(
    private immersionRepo?: ImmersionContentRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.immersionRepo || !this.vocabRepo) {
      console.warn('Required repos not available for ProposeImmersionContent');
      return null;
    }

    try {
      // Get all immersion content
      const allContent = await this.immersionRepo.getAllImmersionContent();
      const now = new Date();
      
      // Filter to only due content (nextShownEarliestAt does not exist or is in the past)
      const dueContent = allContent.filter(content => 
        !content.nextShownEarliestAt || content.nextShownEarliestAt <= now
      );
      
      // Check each due content for vocab readiness threshold
      for (const content of dueContent) {
        if (content.associatedUnits.length === 0) {
          // No associated vocab - consider it ready
          return {
            taskType: 'immersion-content',
            data: {
              contentId: content.uid,
              content: content
            }
          };
        }
        
        // Check what percentage of associated vocab is top-of-mind
        let topOfMindCount = 0;
        const totalCount = content.associatedUnits.length;
        
        for (const vocabId of content.associatedUnits) {
          const vocab = await this.vocabRepo.getVocabByUID(vocabId);
          if (vocab && isCurrentlyTopOfMind(vocab)) {
            topOfMindCount++;
          }
        }
        
        const readinessPercentage = topOfMindCount / totalCount;
        
        // If at least 60% of vocab is top-of-mind, this content is ready
        if (readinessPercentage >= 0.6) {
          console.info(`Proposing immersion content "${content.title}" with ${Math.round(readinessPercentage * 100)}% vocab readiness`);
          return {
            taskType: 'immersion-content',
            data: {
              contentId: content.uid,
              content: content
            }
          };
        }
      }
      
      // No content meets the readiness threshold
      return null;
    } catch (error) {
      console.error('Error proposing immersion content task:', error);
      return null;
    }
  }

  setRepos(immersionRepo: ImmersionContentRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.immersionRepo = immersionRepo;
    this.vocabRepo = vocabRepo;
  }
  
  setImmersionRepo(repo: ImmersionContentRepoContract) {
    this.immersionRepo = repo;
  }
}