// @ts-check

/**
 * @typedef {import('../../types.js').ControllerEl} ControllerEl
 * @typedef {import('../../types.js').DragInputAdapter} DragInputAdapter
 * @typedef {import('../../types.js').DragInputEvent} DragInputEvent
 * @typedef {import('../../types.js').MugEl} MugEl
 * @typedef {import('../../types.js').SceneEl} SceneEl
 */

/** @implements {DragInputAdapter} */
export class VrDragInput {
  /** @type {ControllerEl | null} */
  activeControllerEl = null

  /**
   * @param {{ mugEl: MugEl, sceneEl: SceneEl, emit: (event: DragInputEvent) => void }} opts
   */
  constructor(opts) {
    this.opts = opts
    this.controllerEls = /** @type {ControllerEl[]} */ (
      Array.from(document.querySelectorAll('#left-controller, #right-controller'))
    )

    this.onMugCursorMouseDown = (/** @type {Event} */ evt) => {
      if (!this.sceneEl.is('vr-mode')) return
      const controllerEl = this.getCursorController(evt)
      if (!controllerEl) return
      this.activeControllerEl = controllerEl
      this.emit({ type: 'start', sourceId: controllerEl.id, ray: this.getControllerRay(controllerEl) })
    }

    this.onMugCursorMouseUp = (/** @type {Event} */ evt) => {
      if (!this.sceneEl.is('vr-mode')) return
      const controllerEl = this.getCursorController(evt)
      if (!controllerEl) return
      this.end(controllerEl)
    }

    this.onControllerRelease = (/** @type {Event} */ evt) => {
      const controllerEl = /** @type {ControllerEl | null} */ (evt.currentTarget)
      if (!controllerEl) return
      this.end(controllerEl)
    }

    this.onControllerDisconnected = (/** @type {Event} */ evt) => {
      const controllerEl = /** @type {ControllerEl | null} */ (evt.currentTarget)
      if (!controllerEl || controllerEl !== this.activeControllerEl) return
      this.emit({ type: 'cancel', sourceId: controllerEl.id, reason: 'controllerdisconnected' })
      this.activeControllerEl = null
    }

    this.onSceneExitVr = () => {
      if (!this.activeControllerEl) return
      this.emit({ type: 'cancel', sourceId: this.activeControllerEl.id, reason: 'exit-vr' })
      this.activeControllerEl = null
    }

    this.opts.mugEl.addEventListener('mousedown', this.onMugCursorMouseDown)
    this.opts.mugEl.addEventListener('mouseup', this.onMugCursorMouseUp)
    this.opts.sceneEl.addEventListener('exit-vr', this.onSceneExitVr)
    this.controllerEls.forEach((controllerEl) => {
      controllerEl.addEventListener('selectend', this.onControllerRelease)
      controllerEl.addEventListener('triggerup', this.onControllerRelease)
      controllerEl.addEventListener('controllerdisconnected', this.onControllerDisconnected)
    })
  }

  tick() {
    if (!this.sceneEl.is('vr-mode')) return

    if (this.activeControllerEl) {
      try {
        this.emit({ type: 'move', sourceId: this.activeControllerEl.id, ray: this.getControllerRay(this.activeControllerEl) })
      } catch {
        this.emit({ type: 'cancel', sourceId: this.activeControllerEl.id, reason: 'controller-ray-unavailable' })
        this.activeControllerEl = null
      }
      return
    }

    const hoverController = this.controllerEls.find((controllerEl) => {
      try {
        const ray = this.getControllerRay(controllerEl)
        controllerEl.components.raycaster?.raycaster.ray.copy(ray)
        return controllerEl.components.raycaster?.raycaster.intersectObject(this.opts.mugEl.object3D, true).length
      } catch {
        return false
      }
    })
    if (!hoverController) return
    this.emit({ type: 'hover', sourceId: hoverController.id, ray: this.getControllerRay(hoverController) })
  }

  dispose() {
    this.opts.mugEl.removeEventListener('mousedown', this.onMugCursorMouseDown)
    this.opts.mugEl.removeEventListener('mouseup', this.onMugCursorMouseUp)
    this.opts.sceneEl.removeEventListener('exit-vr', this.onSceneExitVr)
    this.controllerEls.forEach((controllerEl) => {
      controllerEl.removeEventListener('selectend', this.onControllerRelease)
      controllerEl.removeEventListener('triggerup', this.onControllerRelease)
      controllerEl.removeEventListener('controllerdisconnected', this.onControllerDisconnected)
    })
  }

  refreshRaycasters() {
    this.controllerEls.forEach((controllerEl) => {
      controllerEl.components.raycaster?.refreshObjects?.()
    })
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
   * @param {Event} evt
   * @returns {ControllerEl | null}
   */
  getCursorController(evt) {
    const { cursorEl } = /** @type {CustomEvent<{ cursorEl?: Element }>} */ (evt).detail ?? {}
    return this.controllerEls.find((controllerEl) => controllerEl === cursorEl) ?? null
  }

  /**
   * @param {ControllerEl} controllerEl
   */
  end(controllerEl) {
    if (this.activeControllerEl !== controllerEl) return
    try {
      this.emit({ type: 'end', sourceId: controllerEl.id, ray: this.getControllerRay(controllerEl) })
    } catch {
      this.emit({ type: 'cancel', sourceId: controllerEl.id, reason: 'controller-ray-unavailable-on-release' })
    }
    this.activeControllerEl = null
  }

  /**
   * @param {ControllerEl} controllerEl
   * @returns {THREE.Ray}
   */
  getControllerRay(controllerEl) {
    const raycasterComponent = controllerEl.components.raycaster
    if (!raycasterComponent) {
      throw new Error(`Controller "${controllerEl.id}" is missing the raycaster component.`)
    }

    raycasterComponent.updateOriginDirection()
    return raycasterComponent.raycaster.ray.clone()
  }
}
