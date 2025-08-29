export interface ClozeData {
  beforeWord: string;
  hiddenWord: string;
  afterWord: string;
  hiddenWordIndex: number;
  hiddenWords?: string[];
}

export function splitTextIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

export function isRTLText(text: string): boolean {
  const rtlChars = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
  return rtlChars.test(text);
}

export function generateClozeFromText(text: string, level: number, isRTL: boolean = false): ClozeData {
  const words = splitTextIntoWords(text);
  
  if (words.length < 1) {
    return {
      beforeWord: '',
      hiddenWord: text,
      afterWord: '',
      hiddenWordIndex: 0
    };
  }

  if (words.length === 1) {
    return {
      beforeWord: '',
      hiddenWord: words[0],
      afterWord: '',
      hiddenWordIndex: 0
    };
  }

  const wordCount = words.length;
  let indicesToHide: number[] = [];
  
  if (level < wordCount) {
    indicesToHide = [level];
  } else {
    const baseIndex = level % wordCount;
    const nextIndex = (baseIndex + 1) % wordCount;
    indicesToHide = [baseIndex, nextIndex];
  }
  
  indicesToHide.sort((a, b) => a - b);
  
  const hiddenWords = indicesToHide.map(i => words[i]);
  const hiddenWord = hiddenWords.join(' ');
  
  let result = [...words];
  for (let i = indicesToHide.length - 1; i >= 0; i--) {
    result[indicesToHide[i]] = '___HIDDEN___';
  }
  
  const textWithPlaceholder = result.join(' ');
  const parts = textWithPlaceholder.split('___HIDDEN___');
  
  return {
    beforeWord: parts[0]?.trim() || '',
    hiddenWord: hiddenWord,
    afterWord: parts[parts.length - 1]?.trim() || '',
    hiddenWordIndex: indicesToHide[0],
    hiddenWords: hiddenWords
  };
}