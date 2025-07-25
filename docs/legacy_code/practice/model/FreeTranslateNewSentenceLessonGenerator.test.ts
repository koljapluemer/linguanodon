import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FreeTranslateNewSentenceLessonGenerator } from './FreeTranslateNewSentenceLessonGenerator';
import type { WordData, SentenceData, LinguisticUnitProgressData } from '@/entities/linguisticUnits';
import type { Card } from 'ts-fsrs';

// Minimal Card mock for test
const mockCard: Card = {
  due: new Date(),
  stability: 1,
  difficulty: 1,
  elapsed_days: 0,
  scheduled_days: 1,
  learning_steps: 0,
  reps: 0,
  lapses: 0,
  state: 0, // 0 = New (valid for ts-fsrs State type, which is a number enum)
};

// Mocks for ExerciseGeneratorFactory and services
vi.mock('./generator/ExerciseGeneratorFactory', () => ({
  ExerciseGeneratorFactory: {
    createContext: vi.fn().mockResolvedValue({}),
    generateSentenceExercise: vi.fn(async (sentence) => ({
      id: `sentence-ex-${sentence.content}`,
      type: 'free-translate',
      prompt: sentence.content,
      data: sentence,
    })),
    generateWordExercise: vi.fn(async (word, level) => ({
      id: `word-ex-${word.content}-l${level}`,
      type: 'reveal',
      prompt: word.content,
      data: word,
    })),
  },
}));

vi.mock('@/entities/linguisticUnits', async () => {
  return {
    wordService: {
      getReasonableDueWords: vi.fn(async (count: number) => [
        { content: 'apple', language: 'en', type: 'word' },
        { content: 'banana', language: 'en', type: 'word' },
      ].slice(0, count)),
    },
    sentenceService: {
      getReasonableDueSentences: vi.fn(async (count: number) => [
        { content: 'I like apples.', language: 'en', type: 'sentence' },
        { content: 'Bananas are yellow.', language: 'en', type: 'sentence' },
      ].slice(0, count)),
    },
  };
});

describe('FreeTranslateNewSentenceLessonGenerator', () => {
  let words: WordData[];
  let sentences: SentenceData[];
  let progressData: LinguisticUnitProgressData[];

  beforeEach(() => {
    words = [
      { content: 'apple', language: 'en', type: 'word' },
      { content: 'banana', language: 'en', type: 'word' },
      { content: 'pear', language: 'en', type: 'word' },
    ];
    sentences = [
      { content: 'I like apples.', language: 'en', type: 'sentence' },
      { content: 'Bananas are yellow.', language: 'en', type: 'sentence' },
    ];
    progressData = [];
  });

  it('generates a lesson with a sentence exercise at the end if eligible', async () => {
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(5);
    expect(lesson.exercises.length).toBeLessThanOrEqual(20);
    // Last exercise should be a sentence exercise (type: 'free-translate')
    expect(lesson.exercises[lesson.exercises.length - 1].type).toBe('free-translate');
  });

  it('generates only word exercises if no sentences are provided', async () => {
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, [], progressData);
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(5);
    expect(lesson.exercises.every(ex => ex.type === 'reveal')).toBe(true);
  });

  it('generates only sentence exercises if no words are provided', async () => {
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson([], sentences, progressData);
    // Should have at least one sentence exercise (type: 'free-translate')
    expect(lesson.exercises.some(ex => ex.type === 'free-translate')).toBe(true);
  });

  it('shuffles word exercises but keeps sentence exercise at the end', async () => {
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    const last = lesson.exercises[lesson.exercises.length - 1];
    expect(last.type).toBe('free-translate');
    // The rest should be word exercises (type: 'reveal')
    expect(lesson.exercises.slice(0, -1).every(ex => ex.type === 'reveal')).toBe(true);
  });

  it('handles case where all sentences have been seen', async () => {
    progressData = sentences.map(s => ({ language: s.language, content: s.content, type: 'sentence', cards: {} }));
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    // Should still generate a lesson
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('returns empty lesson if no words or sentences', async () => {
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson([], [], []);
    expect(lesson.exercises.length).toBe(0);
  });

  it('generates exercises for words in the special sentence', async () => {
    // The first sentence contains 'apple', so we expect a word exercise for 'apple'
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    const hasAppleWordExercise = lesson.exercises.some(ex => ex.type === 'reveal' && ex.prompt === 'apple');
    expect(hasAppleWordExercise).toBe(true);
  });

  it('generates exercises at different levels based on progress', async () => {
    progressData = [
      { language: 'en', content: 'apple', type: 'word', cards: { 0: mockCard, 1: mockCard } }, // level 2
      { language: 'en', content: 'banana', type: 'word', cards: { 0: mockCard } }, // level 1
    ];
    const lesson = await FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    // Should generate exercises for apple at level 2, banana at level 1
    const appleEx = lesson.exercises.find(ex => ex.id.includes('apple'));
    const bananaEx = lesson.exercises.find(ex => ex.id.includes('banana'));
    expect(appleEx?.id).toContain('l2');
    expect(bananaEx?.id).toContain('l1');
  });
}); 