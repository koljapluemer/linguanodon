// @ts-check
// Port of infinite-sentences-frontend's src/entities/sentences/keys.ts

/**
 * @param {string} nativeIso
 * @param {string} targetIso
 * @param {number} index
 */
export function buildSentenceKey(nativeIso, targetIso, index) {
  return `${nativeIso}:${targetIso}:${index}`;
}

/**
 * @param {string} targetIso
 * @param {string} content
 */
export function buildPartKey(targetIso, content) {
  return `${targetIso}::${content}`;
}
