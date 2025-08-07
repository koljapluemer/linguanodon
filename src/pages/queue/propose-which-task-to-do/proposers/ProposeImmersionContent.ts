import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';

export class ProposeImmersionContent implements TaskProposerContract {
  constructor(
    private resourceRepo?: ResourceRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeTask(): Promise<Task | null> {
    if (!this.resourceRepo || !this.vocabRepo) {
      console.warn('Required repos not available for ProposeImmersionContent');
      return null;
    }

    try {
      // Get all resources that are immersion content
      const allResources = await this.resourceRepo.getAllResources();
      const allContent = allResources.filter(resource => resource.isImmersionContent);
      
      // TODO: Check due status from TaskData instead of ResourceData
      // For now, consider all immersion content as potentially due
      const dueContent = allContent;
      
      // Check each due content for vocab readiness threshold
      for (const content of dueContent) {
        if (content.vocab.length === 0) {
          // No associated vocab - consider it ready
          return {
            uid: crypto.randomUUID(),
            taskType: 'immersion-content',
            title: `Consume: ${content.title}`,
            prompt: `Consume the immersion content "${content.title}".`,
            evaluateCorrectnessAndConfidenceAfterDoing: false,
            decideWhetherToDoAgainAfterDoing: true,
            isActive: true,
            taskSize: 'big',
            associatedUnits: [{ type: 'Resource', uid: content.uid }],
            mayBeConsideredDone: false,
            isDone: false
          };
        }
        
        // Check what percentage of associated vocab is top-of-mind
        let topOfMindCount = 0;
        const totalCount = content.vocab.length;
        
        for (const vocabId of content.vocab) {
          const vocab = await this.vocabRepo.getVocabByUID(vocabId);
          if (vocab && isCurrentlyTopOfMind(vocab)) {
            topOfMindCount++;
          }
        }
        
        const readinessPercentage = topOfMindCount / totalCount;
        
        // If at least 60% of vocab is top-of-mind, this content is ready
        if (readinessPercentage >= 0.6) {
          return {
            uid: crypto.randomUUID(),
            taskType: 'immersion-content',
            title: `Consume: ${content.title}`,
            prompt: `Consume the immersion content "${content.title}".`,
            evaluateCorrectnessAndConfidenceAfterDoing: false,
            decideWhetherToDoAgainAfterDoing: true,
            isActive: true,
            taskSize: 'big',
            associatedUnits: [{ type: 'Resource', uid: content.uid }],
            mayBeConsideredDone: false,
            isDone: false
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

  setRepos(resourceRepo: ResourceRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.resourceRepo = resourceRepo;
    this.vocabRepo = vocabRepo;
  }
}