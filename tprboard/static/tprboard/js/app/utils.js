// @ts-check

/**
 * @template T
 * @param {T[]} items
 * @returns {T}
 */
export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export function shuffled(items) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}
