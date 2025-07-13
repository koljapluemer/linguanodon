import { getClozePlaceholder } from './getClozePlaceholder'

/**
 * Replace the word token at wordIdx with a cloze placeholder, preserving punctuation and spacing.
 */
export function makeClozeTokens(tokens: string[], wordIdx: number): string {
  const clozeTokens = [...tokens]
  clozeTokens[wordIdx] = getClozePlaceholder(tokens[wordIdx])
  return clozeTokens.join('')
}
