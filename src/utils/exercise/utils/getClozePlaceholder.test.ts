import { describe, it, expect } from 'vitest'
import { getClozePlaceholder } from './getClozePlaceholder'

describe('getClozePlaceholder', () => {
  it('should return ??? for LTR text', () => {
    expect(getClozePlaceholder('hello')).toBe('???')
    expect(getClozePlaceholder('world')).toBe('???')
    expect(getClozePlaceholder('test')).toBe('???')
  })

  it('should return ??? for English words with numbers', () => {
    expect(getClozePlaceholder('hello123')).toBe('???')
    expect(getClozePlaceholder('123hello')).toBe('???')
    expect(getClozePlaceholder('h3ll0')).toBe('???')
  })

  it('should return ??? for words with apostrophes', () => {
    expect(getClozePlaceholder("don't")).toBe('???')
    expect(getClozePlaceholder("I'm")).toBe('???')
    expect(getClozePlaceholder("you're")).toBe('???')
  })

  it('should return ??? for words with hyphens', () => {
    expect(getClozePlaceholder('hello-world')).toBe('???')
    expect(getClozePlaceholder('self-driving')).toBe('???')
    expect(getClozePlaceholder('up-to-date')).toBe('???')
  })

  it('should return ??? for Cyrillic text', () => {
    expect(getClozePlaceholder('привет')).toBe('???')
    expect(getClozePlaceholder('мир')).toBe('???')
    expect(getClozePlaceholder('тест')).toBe('???')
  })

  it('should return ??? for Chinese characters', () => {
    expect(getClozePlaceholder('你好')).toBe('???')
    expect(getClozePlaceholder('世界')).toBe('???')
    expect(getClozePlaceholder('测试')).toBe('???')
  })

  it('should return ??? for Japanese characters', () => {
    expect(getClozePlaceholder('こんにちは')).toBe('???')
    expect(getClozePlaceholder('世界')).toBe('???')
    expect(getClozePlaceholder('テスト')).toBe('???')
  })

  it('should return ؟؟؟ for Arabic text', () => {
    expect(getClozePlaceholder('مرحبا')).toBe('؟؟؟')
    expect(getClozePlaceholder('بالعالم')).toBe('؟؟؟')
    expect(getClozePlaceholder('أهلاً')).toBe('؟؟؟')
  })

  it('should return ؟؟؟ for Hebrew text', () => {
    expect(getClozePlaceholder('שלום')).toBe('؟؟؟')
    expect(getClozePlaceholder('עולם')).toBe('؟؟؟')
    expect(getClozePlaceholder('בְּרֵאשִׁית')).toBe('؟؟؟')
  })

  it('should return ؟؟؟ for Persian text', () => {
    expect(getClozePlaceholder('سلام')).toBe('؟؟؟')
    expect(getClozePlaceholder('دنیا')).toBe('؟؟؟')
    expect(getClozePlaceholder('خوش آمدید')).toBe('؟؟؟')
  })

  it('should return ؟؟؟ for Urdu text', () => {
    expect(getClozePlaceholder('ہیلو')).toBe('؟؟؟')
    expect(getClozePlaceholder('دنیا')).toBe('؟؟؟')
    expect(getClozePlaceholder('خوش آمدید')).toBe('؟؟؟')
  })

  it('should return ؟؟؟ for mixed Arabic text', () => {
    expect(getClozePlaceholder('مرحبا بالعالم')).toBe('؟؟؟')
    expect(getClozePlaceholder('أهلاً وسهلاً')).toBe('؟؟؟')
  })

  it('should handle empty string', () => {
    expect(getClozePlaceholder('')).toBe('???')
  })

  it('should handle string with only spaces', () => {
    expect(getClozePlaceholder('   ')).toBe('???')
  })

  it('should handle string with only punctuation', () => {
    expect(getClozePlaceholder('...!!!')).toBe('???')
    expect(getClozePlaceholder('،؟…')).toBe('؟؟؟')
  })

  it('should handle numbers and symbols', () => {
    expect(getClozePlaceholder('123')).toBe('???')
    expect(getClozePlaceholder('@#$%')).toBe('???')
  })

  it('should handle mixed punctuation', () => {
    expect(getClozePlaceholder('Hello, world!')).toBe('???')
    expect(getClozePlaceholder('مرحبا، بالعالم!')).toBe('؟؟؟')
  })

  it('should handle edge case with equal character counts', () => {
    // This should default to LTR when counts are equal
    expect(getClozePlaceholder('aا')).toBe('???')
  })

  it('should handle accented characters', () => {
    expect(getClozePlaceholder('café')).toBe('???')
    expect(getClozePlaceholder('naïve')).toBe('???')
    expect(getClozePlaceholder('résumé')).toBe('???')
  })

  it('should handle German umlauts', () => {
    expect(getClozePlaceholder('über')).toBe('???')
    expect(getClozePlaceholder('möglich')).toBe('???')
    expect(getClozePlaceholder('größe')).toBe('???')
  })

  it('should handle French characters', () => {
    expect(getClozePlaceholder('français')).toBe('???')
    expect(getClozePlaceholder('garçon')).toBe('???')
    expect(getClozePlaceholder('hôtel')).toBe('???')
  })
}) 