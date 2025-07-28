import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposerByExamples } from './ProposerByExamples';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ExampleData } from '@/entities/examples/ExampleData';

// Mock the dependencies
vi.mock('@/entities/vocab/isCurrentlyTopOfMind', () => ({
  isCurrentlyTopOfMind: vi.fn()
}));

vi.mock('@/shared/arrayUtils', () => ({
  pickRandom: vi.fn()
}));

import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import { pickRandom } from '@/shared/arrayUtils';

describe('ProposerByExamples', () => {
  let proposer: ProposerByExamples;
  let mockExampleRepo: ExampleRepoContract;
  let mockVocabRepo: VocabAndTranslationRepoContract;

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

  const createMockExample = (id: string, associatedVocab: string[]): ExampleData => ({
    id,
    language: 'en',
    content: `Example ${id}`,
    translation: `Translation ${id}`,
    associatedVocab,
    associatedTasks: [],
    isUserCreated: false,
    lastDownloadedAt: new Date()
  });

  beforeEach(() => {
    mockExampleRepo = {
      getExamplesForVocabPractice: vi.fn(),
    } as Partial<ExampleRepoContract> as ExampleRepoContract;

    mockVocabRepo = {
      getVocabByUID: vi.fn(),
    } as Partial<VocabAndTranslationRepoContract> as VocabAndTranslationRepoContract;

    proposer = new ProposerByExamples(mockExampleRepo, mockVocabRepo);

    // Reset mocks
    vi.mocked(isCurrentlyTopOfMind).mockReset();
    vi.mocked(pickRandom).mockReset();
  });

  describe('proposeVocab', () => {
    it('should return empty array when repos are not available', async () => {
      const proposerWithoutRepos = new ProposerByExamples();
      
      const result = await proposerWithoutRepos.proposeVocab(5);
      
      expect(result).toEqual([]);
    });

    it('should return empty array when no eligible examples exist', async () => {
      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue([]);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when all examples have no associated vocab', async () => {
      const examples = [
        createMockExample('1', []),
        createMockExample('2', [])
      ];
      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when all examples have 80%+ top-of-mind vocab', async () => {
      const examples = [
        createMockExample('1', ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'])
      ];
      const vocabItems = [
        createMockVocab('vocab1'),
        createMockVocab('vocab2'),
        createMockVocab('vocab3'),
        createMockVocab('vocab4'),
        createMockVocab('vocab5')
      ];

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      // All vocab is top-of-mind (100%)
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(true);

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should propose vocab from example with less than 80% top-of-mind vocab', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      const examples = [
        createMockExample('1', ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'])
      ];
      const vocabItems = [
        createMockVocab('vocab1', 1, pastDate), // Due
        createMockVocab('vocab2', 0, pastDate), // New and due
        createMockVocab('vocab3', 3, futureDate), // Not due, top-of-mind
        createMockVocab('vocab4', 3, futureDate), // Not due, top-of-mind
        createMockVocab('vocab5', 3, futureDate)  // Not due, top-of-mind
      ];

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      
      // Mock isCurrentlyTopOfMind: only vocab3, vocab4, vocab5 are top-of-mind (60% total)
      vi.mocked(isCurrentlyTopOfMind).mockImplementation((vocab) => 
        ['vocab3', 'vocab4', 'vocab5'].includes(vocab.id)
      );
      
      vi.mocked(pickRandom).mockReturnValue([examples[0]]);

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(2); // vocab1 and vocab2 are due/new
      expect(result.map(v => v.id)).toEqual(['vocab1', 'vocab2']);
    });

    it('should respect target number limit', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const examples = [
        createMockExample('1', ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'])
      ];
      const vocabItems = [
        createMockVocab('vocab1', 1, pastDate),
        createMockVocab('vocab2', 0, pastDate),
        createMockVocab('vocab3', 1, pastDate),
        createMockVocab('vocab4', 1, pastDate),
        createMockVocab('vocab5', 1, pastDate)
      ];

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false); // None are top-of-mind
      vi.mocked(pickRandom).mockReturnValue([examples[0]]);

      const result = await proposer.proposeVocab(3); // Limit to 3

      expect(result).toHaveLength(3);
    });

    it('should skip vocab marked as doNotPractice', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const examples = [
        createMockExample('1', ['vocab1', 'vocab2'])
      ];
      const vocabItems = [
        { ...createMockVocab('vocab1', 1, pastDate), doNotPractice: true },
        createMockVocab('vocab2', 1, pastDate)
      ];

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        vocabItems.find(v => v.id === id)
      );
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false);
      vi.mocked(pickRandom).mockReturnValue([examples[0]]);

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab2');
    });

    it('should handle repository errors gracefully', async () => {
      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockRejectedValue(new Error('Database error'));

      const result = await proposer.proposeVocab(5);

      expect(result).toEqual([]);
    });

    it('should handle missing vocab items', async () => {
      const examples = [
        createMockExample('1', ['vocab1', 'nonexistent'])
      ];

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockImplementation(async (id) => 
        id === 'vocab1' ? createMockVocab('vocab1') : undefined
      );
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false);
      vi.mocked(pickRandom).mockReturnValue([examples[0]]);

      const result = await proposer.proposeVocab(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab1');
    });
  });

  describe('setRepos', () => {
    it('should set both repositories and allow proposing vocab', async () => {
      const proposerWithoutRepos = new ProposerByExamples();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const examples = [createMockExample('1', ['vocab1'])];
      const vocab = createMockVocab('vocab1', 1, pastDate);

      vi.mocked(mockExampleRepo.getExamplesForVocabPractice).mockResolvedValue(examples);
      vi.mocked(mockVocabRepo.getVocabByUID).mockResolvedValue(vocab);
      vi.mocked(isCurrentlyTopOfMind).mockReturnValue(false);
      vi.mocked(pickRandom).mockReturnValue([examples[0]]);

      proposerWithoutRepos.setRepos(mockExampleRepo, mockVocabRepo);
      const result = await proposerWithoutRepos.proposeVocab(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab1');
    });
  });
});