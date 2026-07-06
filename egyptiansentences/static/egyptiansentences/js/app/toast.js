// @ts-check
// Small vanilla replacement for the original app's @meforma/vue-toaster
// notifications, built on daisyUI's own toast/alert classes (already loaded
// globally via base.html) instead of pulling in a new CDN dependency.

/** @typedef {"success" | "error" | "info"} ToastVariant */

const DISMISS_DELAY_MS = 2500;

/** @type {HTMLDivElement | null} */
let container = null;

function getContainer() {
  if (container) return container;
  container = document.createElement("div");
  // toast-bottom (not toast-top) so this never overlaps base.html's navbar.
  container.className = "toast toast-bottom toast-end z-50";
  document.body.appendChild(container);
  return container;
}

/**
 * @param {string} message
 * @param {ToastVariant} [variant]
 */
export function showToast(message, variant = "info") {
  const alertEl = document.createElement("div");
  alertEl.className = `alert alert-${variant} shadow-sm`;
  alertEl.textContent = message;

  const host = getContainer();
  host.appendChild(alertEl);
  window.setTimeout(() => alertEl.remove(), DISMISS_DELAY_MS);
}
