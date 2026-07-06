// @ts-check

/**
 * @typedef {import('../types.js').InteractionMode} InteractionMode
 */

export function registerXrMode() {
  if (AFRAME.components['xr-mode']) return

  AFRAME.registerComponent('xr-mode', {
    mode: /** @type {InteractionMode} */ ('desktop'),

    init() {
      this.mode = 'desktop'
      this._onEnterVr = () => this.setMode('vr')
      this._onExitVr = () => this.setMode('desktop')
      this.el.addEventListener('enter-vr', this._onEnterVr)
      this.el.addEventListener('exit-vr', this._onExitVr)
      this.setMode('desktop')
    },

    remove() {
      this.el.removeEventListener('enter-vr', this._onEnterVr)
      this.el.removeEventListener('exit-vr', this._onExitVr)
    },

    /**
     * @param {InteractionMode} mode
     */
    setMode(mode) {
      if (this.mode === mode) return
      this.mode = mode
      const desktopCamera = document.getElementById('desktop-camera')
      const vrCamera = document.getElementById('vr-camera')
      desktopCamera?.setAttribute('camera', `active: ${mode === 'desktop'}`)
      vrCamera?.setAttribute('camera', `active: ${mode === 'vr'}`)
      this.el.emit('interaction-mode-change', { mode })
    },
  })
}
