// @ts-check
// The TELEX/VNI/Off keystroke method, persisted to localStorage and read by
// the practice page on load - see main.js.

const methodToggle = /** @type {HTMLElement} */ (document.getElementById("method-toggle"));

/** @param {string} m */
function setActive(m) {
  methodToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("btn-active", /** @type {HTMLElement} */ (btn).dataset.method === m);
  });
}

setActive(localStorage.getItem("vnInputMethod") || "off");

methodToggle.addEventListener("click", (e) => {
  const btn = /** @type {HTMLElement} */ (e.target).closest("button[data-method]");
  if (!(btn instanceof HTMLElement) || !btn.dataset.method) return;
  localStorage.setItem("vnInputMethod", btn.dataset.method);
  setActive(btn.dataset.method);
});
