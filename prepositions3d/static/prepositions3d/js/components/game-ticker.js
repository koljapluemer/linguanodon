// @ts-check

/**
 * @typedef {import('../game/game.js').Game} Game
 */

/** @type {Game | null} */
let activeGame = null

/**
 * @param {Game | null} game
 */
export function setGameTickerGame(game) {
  activeGame = game
}

export function registerGameTicker() {
  if (AFRAME.components['game-ticker']) return

  AFRAME.registerComponent('game-ticker', {
    tick(time, delta) {
      activeGame?.tick(time, delta)
    },
  })
}
