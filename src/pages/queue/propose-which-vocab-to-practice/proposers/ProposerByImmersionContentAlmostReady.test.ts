import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposerByImmersionContentAlmostReady } from './ProposerByImmersionContentAlmostReady';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';

// Mock the dependencies
vi.mock('@/shared/arrayUtils', () => ({
  shuffleArray: vi.fn()
}));

vi.mock('@/entities/vocab/isCurrentlyTopOfMind', () => ({
  isCurrentlyTopOfMind: vi.fn()
}));

import { shuffleArray } from '@/shared/arrayUtils';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';

describe('ProposerByImmersionContentAlmostReady', () => {
  let proposer: ProposerByImmersionContentAlmostReady;
  let mockVocabRepo: VocabAndTranslationRepoContract;
  let mockImmersionRepo: ImmersionContentRepoContract;

  const createMockVocab = (id: string, level: number = 1, dueDate: Date = new Date()): VocabData => ({
    id,
    language: 'en',
    content: `word-${id}`,
    translations: [],
    notes: [],
    links: [],
    associatedTasks: [],
    doNotPractice: false,
    progress: {
      due: dueDate,
      stability: 1,
      difficulty: 0.5,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 0,
      reps: level > 0 ? 1 : 0,
      lapses: 0,
      state: 0,
      last_review: new Date(),
      streak: 0,
      level
    }
  });

  const createMockImmersionContent = (uid: string, title: string, associatedUnits: string[]): ImmersionContentData => ({
    uid,
    language: 'en',
    title,
    priority: 1,
    associatedUnits,
    isUserCreated: false,
    lastDownloadedAt: new Date(),
    taskType: 'immersion',
    prompt: `Read and understand: ${title}`
  });

  beforeEach(() => {
    mockVocabRepo = {
      getVocabByUID: vi.fn(),
    } as Partial<VocabAndTranslationRepoContract> as VocabAndTranslationRepoContract;

    mockImmersionRepo = {
      getAllImmersionContent: vi.fn(),
    } as Partial<ImmersionContentRepoContract> as ImmersionContentRepoContract;

    proposer = new ProposerByImmersionContentAlmostReady(mockVocabRepo, mockImmersionRepo);

    // Reset mocks
    vi.mocked(shuffleArray).mockImplementation((arr) => [...arr]); // Return array as-is by default
    vi.mocked(isCurrentlyTopOfMind).mockReset();
  });

  describe('proposeVocab', () => {
    it('should return empty array when repos are not available', async () => {
      const proposerWithoutRepos = new ProposerByImmersionContentAlmostReady();
      
      const result = await proposerWithoutRepos.proposeVocab(5);
      
      expect(result).toEqual([]);
    });

    it('should return empty array when no immersion content exists', async () => {
      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue([]);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when all content has no associated vocab', async () => {
      const content = [
        createMockImmersionContent('1', 'Content 1', []),
        createMockImmersionContent('2', 'Content 2', [])
      ];
      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when all content has 90%+ top-of-mind vocab', async () => {
      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'])
      ];
      const vocabItems = [
        createMockVocab('vocab1'),
        createMockVocab('vocab2'),
        createMockVocab('vocab3'),
        createMockVocab('vocab4'),
        createMockVocab('vocab5')
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // All vocab is top-of-mind (100%)
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(true);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should select content with highest top-of-mind percentage below 90%', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2', 'vocab3', 'vocab4']), // 50% top-of-mind
        createMockImmersionContent('2', 'Content 2', ['vocab5', 'vocab6', 'vocab7', 'vocab8', 'vocab9']) // 60% top-of-mind
      ];

      const vocabItems = [
        // Content 1: 2/4 are top-of-mind (50%)
        createMockVocab('vocab1', 1, pastDate), // Due, not top-of-mind
        createMockVocab('vocab2', 1, pastDate), // Due, not top-of-mind  
        createMockVocab('vocab3', 3, futureDate), // Top-of-mind (level 3, not due)
        createMockVocab('vocab4', 3, futureDate), // Top-of-mind (level 3, not due)
        
        // Content 2: 3/5 are top-of-mind (60%)
        createMockVocab('vocab5', 1, pastDate), // Due, not top-of-mind
        createMockVocab('vocab6', 1, pastDate), // Due, not top-of-mind
        createMockVocab('vocab7', 3, futureDate), // Top-of-mind (level 3, not due)
        createMockVocab('vocab8', 3, futureDate), // Top-of-mind (level 3, not due)
        createMockVocab('vocab9', 3, futureDate), // Top-of-mind (level 3, not due)
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      
      // Mock isCurrentlyTopOfMind: level >= 3 and not due
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => 
        vocab.progress.level >= 3 && vocab.progress.due > new Date()
      );

      const result = await proposer.proposeVocab(5);

      // Should select Content 2 (60% > 50%) and return its due vocab
      expect(result).toHaveLength(2);
      expect(result.map(v => v.id).sort()).toEqual(['vocab5', 'vocab6']);
    });

    it('should respect target number limit', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'])
      ];
      const vocabItems = [
        createMockVocab('vocab1', 1, pastDate),
        createMockVocab('vocab2', 0, pastDate), // New vocab
        createMockVocab('vocab3', 1, pastDate),
        createMockVocab('vocab4', 1, pastDate),
        createMockVocab('vocab5', 1, pastDate)
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // Mock 1 out of 5 as top-of-mind (20% < 90%)
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => vocab.id === 'vocab1');

      const result = await proposer.proposeVocab(3); // Limit to 3

      expect(result).toHaveLength(3);
    });

    it('should include new vocab (reps = 0) even if not due', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2'])
      ];
      const vocabItems = [
        createMockVocab('vocab1', 0, futureDate), // New vocab, not due yet
        createMockVocab('vocab2', 1, futureDate)  // Not new, not due
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // Mock some vocab as top-of-mind to have a non-zero percentage < 90%
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => vocab.id === 'vocab2');

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab1'); // Only new vocab is included
    });

    it('should skip vocab marked as doNotPractice', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2'])
      ];
      const vocabItems = [
        { ...createMockVocab('vocab1', 1, pastDate), doNotPractice: true },
        createMockVocab('vocab2', 1, pastDate)
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // Mock some vocab as top-of-mind to have a non-zero percentage < 90%
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => vocab.id === 'vocab2');

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab2');
    });

    it('should handle missing vocab items gracefully', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'nonexistent'])
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        id === 'vocab1' ? createMockVocab('vocab1', 1, pastDate) : undefined
      );
      // Mock no vocab as top-of-mind, percentage will be 0/2 = 0% < 90% and 0 > -1
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false);

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab1');
    });

    it('should shuffle the results', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const content = [
        createMockImmersionContent('1', 'Content 1', ['vocab1', 'vocab2', 'vocab3'])
      ];
      const vocabItems = [
        createMockVocab('vocab1', 1, pastDate),
        createMockVocab('vocab2', 1, pastDate),
        createMockVocab('vocab3', 1, pastDate)
      ];

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // Mock some vocab as top-of-mind to have a non-zero percentage < 90%
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => vocab.id === 'vocab2');
      vi.mocked(shuffleArray).mockReturnValue([vocabItems[2], vocabItems[0], vocabItems[1]]);

      const result = await proposer.proposeVocab(5);

      expect(shuffleArray).toHaveBeenCalledWith(vocabItems);
      expect(result).toEqual([vocabItems[2], vocabItems[0], vocabItems[1]]);
    });

    it('should handle repository errors gracefully', async () => {
      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockRejectedValue(new Error('Database error'));

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });
  });

  describe('setRepos', () => {
    it('should set both repositories and allow proposing vocab', async () => {
      const proposerWithoutRepos = new ProposerByImmersionContentAlmostReady();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const content = [createMockImmersionContent('1', 'Content 1', ['vocab1'])];
      const vocab = createMockVocab('vocab1', 1, pastDate);

      vi.mocked(mockImmersionRepo.getAllImmersionContent).mockResolvedValue(content);
      vi.mocked(mockVocabRepo.getVocabByUID).mockResolvedValue(vocab);
      // Mock no vocab as top-of-mind, percentage will be 0/1 = 0% < 90% and 0 > -1
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false);

      proposerWithoutRepos.setRepos(mockVocabRepo, mockImmersionRepo);
      const result = await proposerWithoutRepos.proposeVocab(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab1');
    });
  });
});