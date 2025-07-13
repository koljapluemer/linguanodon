import { describe, it, expect } from 'vitest'
import { detectTextDirection } from './detectTextDirection'

describe('detectTextDirection', () => {
  it('should detect LTR for English text', () => {
    expect(detectTextDirection('Hello world')).toBe('ltr')
    expect(detectTextDirection('This is a test')).toBe('ltr')
    expect(detectTextDirection('123 numbers')).toBe('ltr')
  })

  it('should detect LTR for Latin characters with accents', () => {
    expect(detectTextDirection('café')).toBe('ltr')
    expect(detectTextDirection('naïve')).toBe('ltr')
    expect(detectTextDirection('résumé')).toBe('ltr')
  })

  it('should detect LTR for German umlauts', () => {
    expect(detectTextDirection('über')).toBe('ltr')
    expect(detectTextDirection('möglich')).toBe('ltr')
    expect(detectTextDirection('größe')).toBe('ltr')
  })

  it('should detect LTR for French characters', () => {
    expect(detectTextDirection('français')).toBe('ltr')
    expect(detectTextDirection('garçon')).toBe('ltr')
    expect(detectTextDirection('hôtel')).toBe('ltr')
  })

  it('should detect LTR for Cyrillic text', () => {
    expect(detectTextDirection('привет')).toBe('ltr')
    expect(detectTextDirection('мир')).toBe('ltr')
    expect(detectTextDirection('тест')).toBe('ltr')
  })

  it('should detect LTR for Chinese characters', () => {
    expect(detectTextDirection('你好')).toBe('ltr')
    expect(detectTextDirection('世界')).toBe('ltr')
    expect(detectTextDirection('测试')).toBe('ltr')
  })

  it('should detect LTR for Japanese characters', () => {
    expect(detectTextDirection('こんにちは')).toBe('ltr')
    expect(detectTextDirection('世界')).toBe('ltr')
    expect(detectTextDirection('テスト')).toBe('ltr')
  })

  it('should detect RTL for Arabic text', () => {
    expect(detectTextDirection('مرحبا')).toBe('rtl')
    expect(detectTextDirection('بالعالم')).toBe('rtl')
    expect(detectTextDirection('أهلاً وسهلاً')).toBe('rtl')
  })

  it('should detect RTL for Hebrew text', () => {
    expect(detectTextDirection('שלום')).toBe('rtl')
    expect(detectTextDirection('עולם')).toBe('rtl')
    expect(detectTextDirection('בְּרֵאשִׁית')).toBe('rtl')
  })

  it('should detect RTL for Persian text', () => {
    expect(detectTextDirection('سلام')).toBe('rtl')
    expect(detectTextDirection('دنیا')).toBe('rtl')
    expect(detectTextDirection('خوش آمدید')).toBe('rtl')
  })

  it('should detect RTL for Urdu text', () => {
    expect(detectTextDirection('ہیلو')).toBe('rtl')
    expect(detectTextDirection('دنیا')).toBe('rtl')
    expect(detectTextDirection('خوش آمدید')).toBe('rtl')
  })

  it('should detect RTL for mixed Arabic text', () => {
    expect(detectTextDirection('مرحبا بالعالم')).toBe('rtl')
    expect(detectTextDirection('أهلاً وسهلاً بكم')).toBe('rtl')
  })

  it('should handle empty string', () => {
    expect(detectTextDirection('')).toBe('ltr')
  })

  it('should handle string with only spaces', () => {
    expect(detectTextDirection('   ')).toBe('ltr')
  })

  it('should handle string with only punctuation', () => {
    expect(detectTextDirection('...!!!')).toBe('ltr')
    expect(detectTextDirection('،؟…')).toBe('rtl')
  })

  it('should handle numbers and symbols', () => {
    expect(detectTextDirection('123')).toBe('ltr')
    expect(detectTextDirection('@#$%')).toBe('ltr')
  })

  it('should handle mixed punctuation', () => {
    expect(detectTextDirection('Hello, world!')).toBe('ltr')
    expect(detectTextDirection('مرحبا، بالعالم!')).toBe('rtl')
  })

  it('should handle edge case with equal character counts', () => {
    // This should default to LTR when counts are equal
    expect(detectTextDirection('aا')).toBe('ltr')
  })
}) 