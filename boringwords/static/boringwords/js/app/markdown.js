// @ts-check
// Extends saetze's tokenizeCredit (saetze/static/saetze/js/app/credit.js)
// with **bold** and *italic* in addition to [text](url) links. Returns
// typed tokens for v-for rendering as real elements, deliberately never
// producing an HTML string / using v-html, to avoid any HTML-injection risk
// from imported CSV strings (word front/back and photo credits).

/** @typedef {{type: 'text', text: string} | {type: 'bold'|'italic', text: string} | {type: 'link', text: string, href: string}} MarkdownToken */

const TOKEN_PATTERN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

/**
 * @param {string} markdown
 * @returns {MarkdownToken[]}
 */
export function tokenizeMarkdown(markdown) {
  if (!markdown) return [];

  /** @type {MarkdownToken[]} */
  const tokens = [];
  let lastIndex = 0;

  for (const match of markdown.matchAll(TOKEN_PATTERN)) {
    const [fullMatch, linkText, href, boldText, italicText] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      tokens.push({ type: "text", text: markdown.slice(lastIndex, matchIndex) });
    }

    if (linkText !== undefined) tokens.push({ type: "link", text: linkText, href });
    else if (boldText !== undefined) tokens.push({ type: "bold", text: boldText });
    else if (italicText !== undefined) tokens.push({ type: "italic", text: italicText });

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < markdown.length) {
    tokens.push({ type: "text", text: markdown.slice(lastIndex) });
  }

  return tokens;
}
