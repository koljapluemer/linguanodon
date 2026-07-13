// @ts-check

/**
 * @typedef {object} AppLayout
 * @property {HTMLParagraphElement} currentLanguageText
 * @property {HTMLDivElement} languageModalActions
 * @property {HTMLFormElement} languageModalBackdrop
 * @property {HTMLDialogElement} languageModal
 * @property {HTMLDivElement} languageOptions
 * @property {HTMLDivElement} sceneRoot
 * @property {HTMLSpanElement} streakBarCurrentFill
 * @property {HTMLSpanElement} streakBarRecordFill
 * @property {HTMLSpanElement} streakIcon
 * @property {HTMLDivElement} streakIndicator
 * @property {HTMLSpanElement} streakValue
 * @property {HTMLButtonElement} taskReplayButton
 * @property {HTMLHeadingElement} taskText
 */

/**
 * @template {Element} T
 * @param {ParentNode} parent
 * @param {string} selector
 * @returns {T}
 */
function queryRequiredElement(parent, selector) {
  const element = /** @type {T | null} */ (parent.querySelector(selector))

  if (!element) {
    throw new Error(`Required element not found: ${selector}`)
  }

  return element
}

/**
 * @param {HTMLDivElement} app
 * @param {{ explainImageSrc: string }} options
 * @returns {AppLayout}
 */
export function createAppLayout(app, options) {
  app.innerHTML = `
    <div id="layout" class="flex h-full w-full flex-col" data-theme="light">
      <div class="flex min-h-0 min-w-0 flex-1">
        <div class="flex min-w-0 flex-1 flex-col">
          <section id="streak-panel" class="px-8 pt-5 pb-2">
            <div class="mx-auto flex max-w-5xl items-center gap-3">
              <div
                id="streak-bar"
                class="relative h-2 flex-1 overflow-hidden rounded-full bg-base-300/55"
                aria-hidden="true"
              >
                <span
                  id="streak-bar-current-fill"
                  class="absolute inset-y-0 left-0 w-0 rounded-full transition-[width,background-color,opacity] duration-300"
                ></span>
                <span
                  id="streak-bar-record-fill"
                  class="absolute inset-y-0 left-0 w-0 rounded-full transition-[width,background-color,opacity] duration-300"
                ></span>
              </div>
              <div
                id="streak-indicator"
                class="flex shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums text-base-content/70 transition-colors duration-300"
              >
                <span id="streak-icon" class="flex items-center text-amber-500/85"></span>
                <span id="streak-value">0</span>
              </div>
            </div>
          </section>
          <section id="task-panel" class="px-8 pt-7 pb-4 text-center">
            <div class="relative mx-auto max-w-5xl">
              <h1 id="task-text" class="mx-auto min-h-[1.1em] max-w-5xl pr-14 text-4xl font-extrabold leading-none text-balance md:text-6xl"></h1>
              <button
                id="task-replay-button"
                type="button"
                class="btn btn-square btn-ghost absolute top-0 right-0"
                aria-label="Replay task audio"
                title="Replay task audio"
                disabled
              ></button>
            </div>
          </section>
          <div id="scene" class="min-h-0 flex-1"></div>
        </div>
      </div>
      <dialog id="language-modal" class="modal">
        <div class="modal-box max-h-[calc(100vh-4rem)] max-w-2xl overflow-y-auto">
          <div class="mb-4">
            <h2 class="text-lg font-semibold">Which language do you want to practice?</h2>
            <p id="current-language-text" class="text-sm text-base-content/70"></p>
          </div>
          <section class="mb-5 rounded-box bg-base-200/70 p-4">
            <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem] md:items-center">
              <div>
                <h3 class="text-base font-semibold">How to play</h3>
                <p class="mt-2 text-sm leading-6 text-base-content/75">
                  Listen to the spoken instruction, then drag the objects on the board to act it out.
                </p>
                <p class="mt-2 text-sm leading-6 text-base-content/75">
                  Finish the action correctly to get the next task. You can replay the audio any time with the speaker button.
                </p>
              </div>
              <img
                src="${options.explainImageSrc}"
                alt="Example board showing draggable objects during a task"
                class="h-36 w-full rounded-xl object-cover shadow-sm md:h-32"
              />
            </div>
          </section>
          <div class="mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-base-content/55">Choose language</h3>
          </div>
          <div id="language-options" class="flex flex-col gap-2"></div>
          <div id="language-modal-actions" class="modal-action">
            <form method="dialog">
              <button type="submit" class="btn">Close</button>
            </form>
          </div>
        </div>
        <form id="language-modal-backdrop" method="dialog" class="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </div>
  `

  return {
    currentLanguageText: queryRequiredElement(app, '#current-language-text'),
    languageModalActions: queryRequiredElement(app, '#language-modal-actions'),
    languageModalBackdrop: queryRequiredElement(app, '#language-modal-backdrop'),
    languageModal: queryRequiredElement(app, '#language-modal'),
    languageOptions: queryRequiredElement(app, '#language-options'),
    sceneRoot: queryRequiredElement(app, '#scene'),
    streakBarCurrentFill: queryRequiredElement(app, '#streak-bar-current-fill'),
    streakBarRecordFill: queryRequiredElement(app, '#streak-bar-record-fill'),
    streakIcon: queryRequiredElement(app, '#streak-icon'),
    streakIndicator: queryRequiredElement(app, '#streak-indicator'),
    streakValue: queryRequiredElement(app, '#streak-value'),
    taskReplayButton: queryRequiredElement(app, '#task-replay-button'),
    taskText: queryRequiredElement(app, '#task-text'),
  }
}
