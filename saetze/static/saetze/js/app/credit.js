// @ts-check
// Port of saetze's tokenizeCredit (LessonPracticePage.vue) - splits a
// "[text](url) rest of the string" markdown-link attribution into text/link
// tokens so the template can render real <a> elements via v-for instead of
// v-html, avoiding any HTML-injection risk from the imported credit strings.

/** @typedef {import('../types.js').CreditToken} CreditToken */

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * @param {string} markdown
 * @returns {CreditToken[]}
 */
export function tokenizeCredit(markdown) {
  if (!markdown) return [];

  /** @type {CreditToken[]} */
  const tokens = [];
  let lastIndex = 0;

  for (const match of markdown.matchAll(LINK_PATTERN)) {
    const [fullMatch, text, href] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      tokens.push({ type: "text", text: markdown.slice(lastIndex, matchIndex) });
    }
    tokens.push({ type: "link", text, href });
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < markdown.length) {
    tokens.push({ type: "text", text: markdown.slice(lastIndex) });
  }

  return tokens;
}
