import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';
import type { Card } from 'ts-fsrs';

/**
 * Tracks FSRS progress for a single word or sentence (linguistic unit).
 * Keyed by language, content, and type ('word' | 'sentence').
 * Cards are stored per level (0-9).
 */
export interface LinguisticUnitProgressData extends LinguisticUnitIdentification {
  cards: Record<number, Card>;
} 