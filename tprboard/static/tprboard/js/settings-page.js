// @ts-check
import { loadLanguageOptions } from './app/data.js'

/** @typedef {import('./types.js').LanguageOption} LanguageOption */

const LANGUAGE_STORAGE_KEY = 'tpr-board.language-code'

/** @type {{apiLanguagesUrl: string}} */
const config = JSON.parse(
  /** @type {HTMLScriptElement} */ (document.getElementById('tprboard-settings-config')).textContent ?? '{}',
)

const root = /** @type {HTMLElement} */ (document.getElementById('app'))

root.innerHTML = `
  <section class="mx-auto flex w-full max-w-md flex-col gap-4 py-8">
    <h1 class="text-2xl font-semibold">Settings</h1>
    <div>
      <h2 class="mb-2 text-sm font-semibold uppercase tracking-[0.18em] opacity-60">Language</h2>
      <p id="current-language-text" class="mb-3 text-sm opacity-70"></p>
      <div id="language-options" class="flex flex-col gap-2"></div>
    </div>
  </section>
`

const currentLanguageText = /** @type {HTMLElement} */ (document.getElementById('current-language-text'))
const languageOptionsRoot = /** @type {HTMLElement} */ (document.getElementById('language-options'))

function updateActiveStates() {
  const selected = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  languageOptionsRoot.querySelectorAll('button[data-language-code]').forEach((button) => {
    const isSelected = /** @type {HTMLElement} */ (button).dataset.languageCode === selected
    button.classList.toggle('btn-primary', isSelected)
    button.classList.toggle('btn-outline', !isSelected)
  })
}

/** @param {LanguageOption[]} languageOptions */
function renderCurrentLanguageText(languageOptions) {
  const selected = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const current = languageOptions.find((option) => option.code === selected)
  currentLanguageText.textContent = current ? `Current: ${current.name}` : 'No language selected yet.'
}

async function init() {
  const languageOptions = await loadLanguageOptions(config)

  languageOptionsRoot.replaceChildren(
    ...languageOptions.map(({ code, name }) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.languageCode = code
      button.className = 'btn min-h-16 w-full justify-between px-4'

      const nameText = document.createElement('span')
      nameText.className = 'text-left text-base font-medium'
      nameText.textContent = name

      const codeText = document.createElement('span')
      codeText.className = 'rounded-full bg-base-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-60'
      codeText.textContent = code

      button.append(nameText, codeText)
      button.addEventListener('click', () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
        updateActiveStates()
        renderCurrentLanguageText(languageOptions)
      })
      return button
    }),
  )

  updateActiveStates()
  renderCurrentLanguageText(languageOptions)
}

init().catch((error) => {
  console.error(error)
})
