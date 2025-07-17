/**
 * Splits a sentence into tokens: words and punctuation, preserving order
 */
export function splitIntoTokens(sentence: string): string[] {
  const tokens: string[] = []
  let current = ''
  let currentType: 'word' | 'space' | 'punctuation' | null = null

  for (let i = 0; i < sentence.length; i++) {
    const char = sentence[i]

    // Handle apostrophes specially
    if (char === "'") {
      const prevChar = sentence[i - 1]
      const nextChar = sentence[i + 1]
      // Apostrophe within a word (surrounded by letters)
      if (/\p{L}/u.test(prevChar) && /\p{L}/u.test(nextChar)) {
        // Treat as part of word
        if (currentType !== 'word') {
          if (current) tokens.push(current)
          current = ''
          currentType = 'word'
        }
        current += char
        continue
      } else {
        // Apostrophe at start or end: split as its own token
        if (current) {
          tokens.push(current)
          current = ''
        }
        tokens.push("'")
        currentType = null
        continue
      }
    }

    // Determine character type
    let charType: 'word' | 'space' | 'punctuation'
    if (/\s/.test(char)) {
      charType = 'space'
    } else if (/[.,!?;:،؟…]/.test(char)) {
      charType = 'punctuation'
    } else {
      charType = 'word'
    }

    // If type changes or we're starting, push current token and start new one
    if (currentType !== null && currentType !== charType) {
      if (current) {
        tokens.push(current)
        current = ''
      }
    }

    current += char
    currentType = charType
  }

  // Add any remaining token
  if (current) {
    tokens.push(current)
  }

  return tokens
}
