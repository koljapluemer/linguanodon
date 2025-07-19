import type { Card } from 'ts-fsrs';

/**
 * Tracks FSRS progress for a single word or sentence (linguistic unit).
 * Keyed by language, content, and type ('word' | 'sentence').
 * Cards are stored per level (0-9).
 */
export interface LinguisticUnitProgressData {
  language: string;
  content: string;
  type: 'word' | 'sentence';
  cards: Record<number, Card>;
} 