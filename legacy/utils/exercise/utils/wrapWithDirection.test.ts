import { describe, it, expect } from 'vitest'
import { wrapWithDirection } from './wrapWithDirection'

describe('wrapWithDirection', () => {
  it('should wrap LTR text with dir="ltr"', () => {
    expect(wrapWithDirection('hello')).toBe('<div dir="ltr">hello</div>')
    expect(wrapWithDirection('world')).toBe('<div dir="ltr">world</div>')
    expect(wrapWithDirection('test')).toBe('<div dir="ltr">test</div>')
  })

  it('should wrap English sentences with dir="ltr"', () => {
    expect(wrapWithDirection('Hello world')).toBe('<div dir="ltr">Hello world</div>')
    expect(wrapWithDirection('This is a test')).toBe('<div dir="ltr">This is a test</div>')
  })

  it('should wrap words with numbers with dir="ltr"', () => {
    expect(wrapWithDirection('hello123')).toBe('<div dir="ltr">hello123</div>')
    expect(wrapWithDirection('123hello')).toBe('<div dir="ltr">123hello</div>')
  })

  it('should wrap words with apostrophes with dir="ltr"', () => {
    expect(wrapWithDirection("don't")).toBe('<div dir="ltr">don\'t</div>')
    expect(wrapWithDirection("I'm")).toBe('<div dir="ltr">I\'m</div>')
  })

  it('should wrap words with hyphens with dir="ltr"', () => {
    expect(wrapWithDirection('hello-world')).toBe('<div dir="ltr">hello-world</div>')
    expect(wrapWithDirection('self-driving')).toBe('<div dir="ltr">self-driving</div>')
  })

  it('should wrap Cyrillic text with dir="ltr"', () => {
    expect(wrapWithDirection('привет')).toBe('<div dir="ltr">привет</div>')
    expect(wrapWithDirection('мир')).toBe('<div dir="ltr">мир</div>')
  })

  it('should wrap Chinese characters with dir="ltr"', () => {
    expect(wrapWithDirection('你好')).toBe('<div dir="ltr">你好</div>')
    expect(wrapWithDirection('世界')).toBe('<div dir="ltr">世界</div>')
  })

  it('should wrap Japanese characters with dir="ltr"', () => {
    expect(wrapWithDirection('こんにちは')).toBe('<div dir="ltr">こんにちは</div>')
    expect(wrapWithDirection('世界')).toBe('<div dir="ltr">世界</div>')
  })

  it('should wrap RTL text with dir="rtl"', () => {
    expect(wrapWithDirection('مرحبا')).toBe('<div dir="rtl">مرحبا</div>')
    expect(wrapWithDirection('بالعالم')).toBe('<div dir="rtl">بالعالم</div>')
    expect(wrapWithDirection('أهلاً')).toBe('<div dir="rtl">أهلاً</div>')
  })

  it('should wrap Hebrew text with dir="rtl"', () => {
    expect(wrapWithDirection('שלום')).toBe('<div dir="rtl">שלום</div>')
    expect(wrapWithDirection('עולם')).toBe('<div dir="rtl">עולם</div>')
  })

  it('should wrap Persian text with dir="rtl"', () => {
    expect(wrapWithDirection('سلام')).toBe('<div dir="rtl">سلام</div>')
    expect(wrapWithDirection('دنیا')).toBe('<div dir="rtl">دنیا</div>')
  })

  it('should wrap Urdu text with dir="rtl"', () => {
    expect(wrapWithDirection('ہیلو')).toBe('<div dir="rtl">ہیلو</div>')
    expect(wrapWithDirection('دنیا')).toBe('<div dir="rtl">دنیا</div>')
  })

  it('should wrap mixed Arabic text with dir="rtl"', () => {
    expect(wrapWithDirection('مرحبا بالعالم')).toBe('<div dir="rtl">مرحبا بالعالم</div>')
    expect(wrapWithDirection('أهلاً وسهلاً')).toBe('<div dir="rtl">أهلاً وسهلاً</div>')
  })

  it('should handle empty string', () => {
    expect(wrapWithDirection('')).toBe('<div dir="ltr"></div>')
  })

  it('should handle string with only spaces', () => {
    expect(wrapWithDirection('   ')).toBe('<div dir="ltr">   </div>')
  })

  it('should handle string with only punctuation', () => {
    expect(wrapWithDirection('...!!!')).toBe('<div dir="ltr">...!!!</div>')
    expect(wrapWithDirection('،؟…')).toBe('<div dir="rtl">،؟…</div>')
  })

  it('should handle numbers and symbols', () => {
    expect(wrapWithDirection('123')).toBe('<div dir="ltr">123</div>')
    expect(wrapWithDirection('@#$%')).toBe('<div dir="ltr">@#$%</div>')
  })

  it('should handle mixed punctuation', () => {
    expect(wrapWithDirection('Hello, world!')).toBe('<div dir="ltr">Hello, world!</div>')
    expect(wrapWithDirection('مرحبا، بالعالم!')).toBe('<div dir="rtl">مرحبا، بالعالم!</div>')
  })

  it('should handle edge case with equal character counts', () => {
    // This should default to LTR when counts are equal
    expect(wrapWithDirection('aا')).toBe('<div dir="ltr">aا</div>')
  })

  it('should handle accented characters', () => {
    expect(wrapWithDirection('café')).toBe('<div dir="ltr">café</div>')
    expect(wrapWithDirection('naïve')).toBe('<div dir="ltr">naïve</div>')
    expect(wrapWithDirection('résumé')).toBe('<div dir="ltr">résumé</div>')
  })

  it('should handle German umlauts', () => {
    expect(wrapWithDirection('über')).toBe('<div dir="ltr">über</div>')
    expect(wrapWithDirection('möglich')).toBe('<div dir="ltr">möglich</div>')
    expect(wrapWithDirection('größe')).toBe('<div dir="ltr">größe</div>')
  })

  it('should handle French characters', () => {
    expect(wrapWithDirection('français')).toBe('<div dir="ltr">français</div>')
    expect(wrapWithDirection('garçon')).toBe('<div dir="ltr">garçon</div>')
    expect(wrapWithDirection('hôtel')).toBe('<div dir="ltr">hôtel</div>')
  })

  it('should preserve HTML entities and special characters', () => {
    expect(wrapWithDirection('&amp; &lt; &gt;')).toBe('<div dir="ltr">&amp; &lt; &gt;</div>')
    expect(wrapWithDirection('مرحبا &amp; بالعالم')).toBe('<div dir="rtl">مرحبا &amp; بالعالم</div>')
  })
}) 