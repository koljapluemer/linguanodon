import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposerOfNewVocab } from './ProposerOfNewVocab';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

describe('ProposerOfNewVocab', () => {
  let proposer: ProposerOfNewVocab;
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
      reps: 0, // New vocab has 0 reps
      lapses: 0,
      state: 0,
      last_review: new Date(),
      streak: 0,
      level: 0 // New vocab starts at level 0
    }
  });

  beforeEach(() => {
    mockVocabRepo = {
      getRandomUnseenVocab: vi.fn(),
    } as Partial<VocabAndTranslationRepoContract> as VocabAndTranslationRepoContract;

    proposer = new ProposerOfNewVocab(mockVocabRepo);
  });

  describe('proposeVocab', () => {
    it('should return empty array when vocabRepo is not available', async () => {
      const proposerWithoutRepo = new ProposerOfNewVocab();
      
      const result = await proposerWithoutRepo.proposeVocab(5);
      
      expect(result).toEqual([]);
    });

    it('should return new vocab from repository when available', async () => {
      const mockVocab = [
        createMockVocab('1'),
        createMockVocab('2'),
        createMockVocab('3')
      ];
      
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockResolvedValue(mockVocab);

      const result = await proposer.proposeVocab(5);

      expect(mockVocabRepo.getRandomUnseenVocab).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockVocab);
    });

    it('should pass through the correct target number', async () => {
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockResolvedValue([]);

      await proposer.proposeVocab(15);

      expect(mockVocabRepo.getRandomUnseenVocab).toHaveBeenCalledWith(15);
    });

    it('should return empty array when repository throws error', async () => {
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockRejectedValue(new Error('Database error'));

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when repository returns empty result', async () => {
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockResolvedValue([]);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should handle large target numbers', async () => {
      const mockVocab = Array.from({ length: 100 }, (_, i) => createMockVocab(i.toString()));
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockResolvedValue(mockVocab);

      const result = await proposer.proposeVocab(100);

      expect(mockVocabRepo.getRandomUnseenVocab).toHaveBeenCalledWith(100);
      expect(result).toHaveLength(100);
    });
  });

  describe('setVocabRepo', () => {
    it('should set the vocab repository and allow proposing vocab', async () => {
      const proposerWithoutRepo = new ProposerOfNewVocab();
      const mockVocab = [createMockVocab('1')];
      
      vi.mocked(mockVocabRepo.getRandomUnseenVocab).mockResolvedValue(mockVocab);

      proposerWithoutRepo.setVocabRepo(mockVocabRepo);
      const result = await proposerWithoutRepo.proposeVocab(1);

      expect(result).toEqual(mockVocab);
      expect(mockVocabRepo.getRandomUnseenVocab).toHaveBeenCalledWith(1);
    });
  });
});