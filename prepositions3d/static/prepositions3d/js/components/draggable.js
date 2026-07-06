// @ts-check
import { getUnlockedDropZones } from '../interaction/drop-zone-registry.js'
import { DesktopDragInput } from '../interaction/input/desktop-drag-input.js'
import { VrDragInput } from '../interaction/input/vr-drag-input.js'
import { MugDragController } from '../interaction/mug-drag-controller.js'

/**
 * @typedef {import('../types.js').SceneEl} SceneEl
 */

export function registerDraggable() {
  if (AFRAME.components['draggable']) return

  AFRAME.registerComponent('draggable', {
    controller: null,
    desktopInput: null,
    vrInput: null,

    init() {
      const sceneEl = /** @type {SceneEl} */ (this.el.sceneEl)

      this.controller = new MugDragController({
        mugEl: this.el,
        sceneEl,
        getDropZones: getUnlockedDropZones,
        refreshInputRaycasters: () => this.vrInput?.refreshRaycasters(),
      })

      this.desktopInput = new DesktopDragInput({
        sceneEl,
        emit: (event) => this.controller.handleInput(event),
      })

      this.vrInput = new VrDragInput({
        mugEl: this.el,
        sceneEl,
        emit: (event) => this.controller.handleInput(event),
      })
    },

    remove() {
      this.desktopInput.dispose()
      this.vrInput.dispose()
      this.controller.dispose()
    },

    tick(time, delta) {
      this.vrInput.tick()
      this.controller.tick(time, delta)
    },

    /**
     * @param {boolean} enabled
     */
    setInteractionEnabled(enabled) {
      this.controller.setInteractionEnabled(enabled)
    },

    snapBack() {
      this.controller.snapBack()
    },

    /**
     * @param {() => void} [onComplete]
     */
    resetToStartWithFade(onComplete) {
      this.controller.resetToStartWithFade(onComplete)
    },
  })
}
