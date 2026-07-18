// @ts-check

/**
 * @param {string} apiDeckUrl
 * @returns {Promise<import('../types.js').DeckResponse>}
 */
export async function loadDeck(apiDeckUrl) {
  const response = await fetch(apiDeckUrl);
  if (!response.ok) {
    throw new Error(`Failed to load deck (${response.status})`);
  }
  return response.json();
}
