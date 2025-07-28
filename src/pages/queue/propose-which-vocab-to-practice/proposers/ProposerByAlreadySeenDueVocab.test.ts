import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposerByAlreadySeenDueVocab } from './ProposerByAlreadySeenDueVocab';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

describe('ProposerByAlreadySeenDueVocab', () => {
  let proposer: ProposerByAlreadySeenDueVocab;
  let mockVocabRepo: VocabAndTranslationRepoContract;

  const createMockVocab = (id: string): VocabData => ({
    id,
    language: 'en',
    content: `word-${id}`,
    translations: [],
    notes: [],
    links: [],
    associatedTasks: [],
    progress: {
      due: new Date(),
      stability: 1,
      difficulty: 0.5,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 0,
      reps: 1,
      lapses: 0,
      state: 0,
      last_review: new Date(),
      streak: 0,
      level: 1
    }
  });

  beforeEach(() => {
    mockVocabRepo = {
      getRandomAlreadySeenDueVocab: vi.fn(),
    } as Partial<VocabAndTranslationRepoContract> as VocabAndTranslationRepoContract;

    proposer = new ProposerByAlreadySeenDueVocab(mockVocabRepo);
  });

  describe('proposeVocab', () => {
    it('should return empty array when vocabRepo is not available', async () => {
      const proposerWithoutRepo = new ProposerByAlreadySeenDueVocab();
      
      const result = await proposerWithoutRepo.proposeVocab(5);
      
      expect(result).toEqual([]);
    });

    it('should return vocab from repository when available', async () => {
      const mockVocab = [
        createMockVocab('1'),
        createMockVocab('2'),
        createMockVocab('3')
      ];
      
      vi.mocked(mockVocabRepo.getRandomAlreadySeenDueVocab).mockResolvedValue(mockVocab);

      const result = await proposer.proposeVocab(5);

      expect(mockVocabRepo.getRandomAlreadySeenDueVocab).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockVocab);
    });

    it('should pass through the correct target number', async () => {
      vi.mocked(mockVocabRepo.getRandomAlreadySeenDueVocab).mockResolvedValue([]);

      await proposer.proposeVocab(10);

      expect(mockVocabRepo.getRandomAlreadySeenDueVocab).toHaveBeenCalledWith(10);
    });

    it('should return empty array when repository throws error', async () => {
      vi.mocked(mockVocabRepo.getRandomAlreadySeenDueVocab).mockRejectedValue(new Error('Database error'));

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when repository returns empty result', async () => {
      vi.mocked(mockVocabRepo.getRandomAlreadySeenDueVocab).mockResolvedValue([]);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });
  });

  describe('setVocabRepo', () => {
    it('should set the vocab repository and allow proposing vocab', async () => {
      const proposerWithoutRepo = new ProposerByAlreadySeenDueVocab();
      const mockVocab = [createMockVocab('1')];
      
      vi.mocked(mockVocabRepo.getRandomAlreadySeenDueVocab).mockResolvedValue(mockVocab);

      proposerWithoutRepo.setVocabRepo(mockVocabRepo);
      const result = await proposerWithoutRepo.proposeVocab(1);

      expect(result).toEqual(mockVocab);
      expect(mockVocabRepo.getRandomAlreadySeenDueVocab).toHaveBeenCalledWith(1);
    });
  });
});