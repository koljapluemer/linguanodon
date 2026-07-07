// @ts-check
import { pullState, trackActiveTime } from '/static/tracking/js/client.js'
import { registerDraggable } from './components/draggable.js'
import { registerDropZone } from './components/drop-zone.js'
import { registerGameTicker, setGameTickerGame } from './components/game-ticker.js'
import { registerMouseLookLimited } from './components/mouse-look-limited.js'
import { registerShadowCatcher } from './components/shadow-catcher.js'
import { registerXrMode } from './components/xr-mode.js'
import { buildScene, UI_LAYOUT, ZONES } from './scene/scene.js'
import { Game } from './game/game.js'
import { DEFAULT_LANGUAGE, getLanguageOptions, loadGlossaryData } from './language/glossary.js'
import { SceneUI } from './ui/scene-ui.js'

/**
 * @typedef {import('./types.js').Prepositions3dConfig} Prepositions3dConfig
 */

/** @type {Prepositions3dConfig} */
const config = JSON.parse(
  /** @type {HTMLScriptElement} */ (document.getElementById('prepositions3d-config')).textContent ?? '{}',
)

registerDraggable()
registerDropZone()
registerGameTicker()
registerMouseLookLimited()
registerShadowCatcher()
registerXrMode()
buildScene(config.modelsBaseUrl)
trackActiveTime('prepositions3d')

const sceneEl = document.querySelector('a-scene')
sceneEl?.addEventListener('loaded', () => {
  void startGame(sceneEl)
})

/**
 * @param {Element} sceneEl
 */
async function startGame(sceneEl) {
  await loadGlossaryData(config.apiLanguagesUrl, config.apiGlossaryUrl)
  /** @type {Game | null} */
  let game = null
  const ui = new SceneUI({
    sceneEl,
    position: UI_LAYOUT.position,
    rotation: UI_LAYOUT.rotation,
    scale: UI_LAYOUT.scale,
    languages: getLanguageOptions(),
    selectedLanguage: DEFAULT_LANGUAGE,
    onLanguageChange: (language) => game?.setLanguage(language),
    onStart: () => game?.startRound(),
    onExit: () => game?.exitGame(),
    onAudioReplay: () => game?.recordAudioReplay(),
  })
  game = new Game({ ui, sceneEl, zones: ZONES, language: DEFAULT_LANGUAGE, soundBaseUrl: config.soundBaseUrl })
  setGameTickerGame(game)
  sceneEl.setAttribute('game-ticker', '')
  void pullState('prepositions3d').then((remoteStates) => game?.mergeRemoteLearningEvents(remoteStates))
}
