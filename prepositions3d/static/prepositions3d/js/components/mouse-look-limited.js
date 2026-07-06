// @ts-check
// Note: full type-checking of THREE.* values requires `three`'s own type
// declarations, which aren't installed locally (THREE is exposed globally
// via AFRAME.THREE at runtime). JSDoc here is intentionally loose on
// THREE-specific types.
const THREE = AFRAME.THREE

/**
 * @param {Element} el
 * @returns {{ x: number, y: number, z: number }}
 */
function getElementRotation(el) {
  const rotation = /** @type {{ x: number, y: number, z: number } | null} */ (el.getAttribute('rotation'))
  return {
    x: rotation?.x ?? 0,
    y: rotation?.y ?? 0,
    z: rotation?.z ?? 0,
  }
}

export function registerMouseLookLimited() {
  if (AFRAME.components['mouse-look-limited']) return

  AFRAME.registerComponent('mouse-look-limited', {
    schema: {
      maxX: { type: 'number', default: 30 },
      maxY: { type: 'number', default: 60 },
    },

    startPosition: null,
    startRotation: null,

    init() {
      this.startPosition = this.el.object3D.position.clone()
      this.startRotation = getElementRotation(this.el)
      this._onMouseMove = this._onMouseMove.bind(this)
      this.el.sceneEl.canvas.addEventListener('mousemove', this._onMouseMove)
    },

    remove() {
      this.el.sceneEl.canvas.removeEventListener('mousemove', this._onMouseMove)
    },

    /**
     * @param {MouseEvent} evt
     */
    _onMouseMove(evt) {
      if (this.el.sceneEl.is('vr-mode')) return
      const rect = this.el.sceneEl.canvas.getBoundingClientRect()
      const normalizedX = THREE.MathUtils.clamp(((evt.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      const normalizedY = THREE.MathUtils.clamp(((evt.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)

      this.el.object3D.rotation.set(
        THREE.MathUtils.degToRad(this.startRotation.x - normalizedY * this.data.maxX),
        THREE.MathUtils.degToRad(this.startRotation.y - normalizedX * this.data.maxY),
        THREE.MathUtils.degToRad(this.startRotation.z),
      )
    },

    tick() {
      if (this.el.sceneEl.is('vr-mode')) return
      this.el.object3D.position.copy(this.startPosition)
      this.el.object3D.rotation.z = THREE.MathUtils.degToRad(this.startRotation.z)
    },
  })
}
