// @ts-check
// Port of tprboard's app/icons.js helper - builds SVG DOM nodes directly
// from the lucide CDN UMD build's icon-node arrays (window.lucide.<Name>),
// since there's no build step to use lucide's Vue/React wrapper components.

/**
 * @typedef {[string, Record<string, string>][]} IconNode
 */

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * @param {IconNode} icon
 * @param {Record<string, string>} [attributes]
 * @returns {SVGSVGElement}
 */
export function createLucideIcon(icon, attributes = {}) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");

  const baseAttributes = {
    xmlns: SVG_NAMESPACE,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    ...attributes,
  };

  Object.entries(baseAttributes).forEach(([name, value]) => {
    svg.setAttribute(name, value);
  });

  icon.forEach(([tagName, childAttributes]) => {
    const child = document.createElementNS(SVG_NAMESPACE, tagName);

    Object.entries(childAttributes).forEach(([name, value]) => {
      if (value !== undefined) {
        child.setAttribute(name, String(value));
      }
    });

    svg.appendChild(child);
  });

  return svg;
}

/**
 * @param {IconNode} icon
 * @param {Record<string, string>} [attributes]
 * @returns {string}
 */
export function lucideIconMarkup(icon, attributes = {}) {
  return createLucideIcon(icon, attributes).outerHTML;
}
