// @ts-check

/**
 * @typedef {import('../types.js').DropZoneEl} DropZoneEl
 * @typedef {import('../types.js').DropZoneHandle} DropZoneHandle
 */

/** @returns {DropZoneHandle[]} */
export function getUnlockedDropZones() {
  return Array.from(document.querySelectorAll('[drop-zone]'))
    .map((el) => ({
      el: /** @type {DropZoneEl} */ (el),
      component: /** @type {any} */ (el).components['drop-zone'],
    }))
    .filter((zone) => Boolean(zone.component?.isUnlocked))
    .map(({ el, component }) => ({
      el,
      hitMesh: component.hitMesh,
      setHighlight: (/** @type {boolean} */ active) => component.setHighlight(active),
    }))
}
