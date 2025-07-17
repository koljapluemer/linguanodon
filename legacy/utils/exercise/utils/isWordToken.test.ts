import { describe, it, expect } from 'vitest'
import { isWordToken } from './isWordToken'

describe('isWordToken', () => {
  it('should return true for English words', () => {
    expect(isWordToken('hello')).toBe(true)
    expect(isWordToken('world')).toBe(true)
    expect(isWordToken('test')).toBe(true)
  })

  it('should return true for words with numbers', () => {
    expect(isWordToken('hello123')).toBe(true)
    expect(isWordToken('123hello')).toBe(true)
    expect(isWordToken('h3ll0')).toBe(true)
  })

  it('should return true for words with apostrophes', () => {
    expect(isWordToken("don't")).toBe(true)
    expect(isWordToken("I'm")).toBe(true)
    expect(isWordToken("you're")).toBe(true)
  })

  it('should return true for words with hyphens', () => {
    expect(isWordToken('hello-world')).toBe(true)
    expect(isWordToken('self-driving')).toBe(true)
    expect(isWordToken('up-to-date')).toBe(true)
  })

  it('should return true for Arabic words', () => {
    expect(isWordToken('مرحبا')).toBe(true)
    expect(isWordToken('بالعالم')).toBe(true)
    expect(isWordToken('أهلاً')).toBe(true)
  })

  it('should return true for Chinese characters', () => {
    expect(isWordToken('你好')).toBe(true)
    expect(isWordToken('世界')).toBe(true)
    expect(isWordToken('测试')).toBe(true)
  })

  it('should return true for Japanese characters', () => {
    expect(isWordToken('こんにちは')).toBe(true)
    expect(isWordToken('世界')).toBe(true)
    expect(isWordToken('テスト')).toBe(true)
  })

  it('should return true for Cyrillic words', () => {
    expect(isWordToken('привет')).toBe(true)
    expect(isWordToken('мир')).toBe(true)
    expect(isWordToken('тест')).toBe(true)
  })

  it('should return false for punctuation', () => {
    expect(isWordToken('.')).toBe(false)
    expect(isWordToken(',')).toBe(false)
    expect(isWordToken('!')).toBe(false)
    expect(isWordToken('?')).toBe(false)
    expect(isWordToken(';')).toBe(false)
    expect(isWordToken(':')).toBe(false)
  })

  it('should return false for Arabic punctuation', () => {
    expect(isWordToken('،')).toBe(false)
    expect(isWordToken('؟')).toBe(false)
    expect(isWordToken('…')).toBe(false)
  })

  it('should return false for whitespace', () => {
    expect(isWordToken(' ')).toBe(false)
    expect(isWordToken('\t')).toBe(false)
    expect(isWordToken('\n')).toBe(false)
    expect(isWordToken('   ')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isWordToken('')).toBe(false)
  })

  it('should return false for pure numbers', () => {
    expect(isWordToken('123')).toBe(false)
    expect(isWordToken('456789')).toBe(false)
    expect(isWordToken('0')).toBe(false)
  })

  it('should return false for mixed punctuation', () => {
    expect(isWordToken('...')).toBe(false)
    expect(isWordToken('!!!')).toBe(false)
    expect(isWordToken('?!')).toBe(false)
  })

  it('should return true for accented characters', () => {
    expect(isWordToken('café')).toBe(true)
    expect(isWordToken('naïve')).toBe(true)
    expect(isWordToken('résumé')).toBe(true)
  })

  it('should return true for German umlauts', () => {
    expect(isWordToken('über')).toBe(true)
    expect(isWordToken('möglich')).toBe(true)
    expect(isWordToken('größe')).toBe(true)
  })

  it('should return true for French characters', () => {
    expect(isWordToken('français')).toBe(true)
    expect(isWordToken('garçon')).toBe(true)
    expect(isWordToken('hôtel')).toBe(true)
  })
}) 