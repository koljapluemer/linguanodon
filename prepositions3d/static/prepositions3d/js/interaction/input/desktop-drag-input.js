// @ts-check
// THREE is exposed globally via AFRAME.THREE at runtime - see the note in
// components/mouse-look-limited.js.
const THREE = AFRAME.THREE

/**
 * @typedef {import('../../types.js').DragInputAdapter} DragInputAdapter
 * @typedef {import('../../types.js').DragInputEvent} DragInputEvent
 * @typedef {import('../../types.js').SceneEl} SceneEl
 */

/**
 * @param {MouseEvent} evt
 * @param {HTMLCanvasElement} canvas
 * @returns {THREE.Vector2}
 */
function getMouseNDC(evt, canvas) {
  const rect = canvas.getBoundingClientRect()
  return new THREE.Vector2(
    ((evt.clientX - rect.left) / rect.width) * 2 - 1,
    -((evt.clientY - rect.top) / rect.height) * 2 + 1,
  )
}

/** @implements {DragInputAdapter} */
export class DesktopDragInput {
  raycaster = new THREE.Raycaster()
  isActive = false

  /**
   * @param {{ sceneEl: SceneEl, emit: (event: DragInputEvent) => void }} opts
   */
  constructor(opts) {
    this.opts = opts

    this.onCanvasMouseDown = (/** @type {MouseEvent} */ evt) => {
      if (this.sceneEl.is('vr-mode')) return
      this.emit({ type: 'start', sourceId: 'mouse', ray: this.getMouseRay(evt) })
      this.isActive = true
    }

    this.onWindowMouseMove = (/** @type {MouseEvent} */ evt) => {
      if (this.sceneEl.is('vr-mode')) return
      const ray = this.getMouseRay(evt)
      this.emit(this.isActive
        ? { type: 'move', sourceId: 'mouse', ray }
        : { type: 'hover', sourceId: 'mouse', ray })
    }

    this.onWindowMouseUp = (/** @type {MouseEvent} */ evt) => {
      if (!this.isActive) return
      this.isActive = false
      this.emit({ type: 'end', sourceId: 'mouse', ray: this.getMouseRay(evt) })
    }

    this.opts.sceneEl.canvas.addEventListener('mousedown', this.onCanvasMouseDown)
    window.addEventListener('mousemove', this.onWindowMouseMove)
    window.addEventListener('mouseup', this.onWindowMouseUp)
  }

  dispose() {
    this.opts.sceneEl.canvas.removeEventListener('mousedown', this.onCanvasMouseDown)
    window.removeEventListener('mousemove', this.onWindowMouseMove)
    window.removeEventListener('mouseup', this.onWindowMouseUp)
  }

  get sceneEl() {
    return this.opts.sceneEl
  }

  /**
   * @param {DragInputEvent} event
   */
  emit(event) {
    this.opts.emit(event)
  }

  /**
   * @param {MouseEvent} evt
   * @returns {THREE.Ray}
   */
  getMouseRay(evt) {
    const mouse = getMouseNDC(evt, this.sceneEl.canvas)
    this.raycaster.setFromCamera(mouse, this.sceneEl.camera)
    return this.raycaster.ray.clone()
  }
}
