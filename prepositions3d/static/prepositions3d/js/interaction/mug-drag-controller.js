// @ts-check
// THREE is exposed globally via AFRAME.THREE at runtime - see the note in
// components/mouse-look-limited.js.
const THREE = AFRAME.THREE

/**
 * @typedef {import('../types.js').DragInputEvent} DragInputEvent
 * @typedef {import('../types.js').DropZoneHandle} DropZoneHandle
 * @typedef {import('../types.js').MugEl} MugEl
 * @typedef {import('../types.js').SceneEl} SceneEl
 */

const MUG_HOVER_OFFSET = 0.06
const MUG_IDLE_BOB_HEIGHT = 0.012
const MUG_IDLE_BOB_SPEED = 0.0018
const MUG_DRAG_SCALE_FACTOR = 1.04
const MUG_RESET_FADE_OUT_MS = 350
const MUG_RESET_FADE_IN_MS = 250
const GRABBABLE_CLASS = 'grabbable'

/**
 * @param {THREE.Object3D} object
 * @returns {boolean}
 */
function isVisibleInScene(object) {
  let current = object
  while (current) {
    if (!current.visible) return false
    current = current.parent
  }
  return true
}

/** @returns {Element[]} */
function getUIButtons() {
  return Array.from(document.querySelectorAll('.ui-interactable'))
    .filter((el) => isVisibleInScene(/** @type {any} */ (el).object3D))
}

/**
 * @param {THREE.Object3D} root
 * @returns {THREE.Material[]}
 */
function getMeshMaterials(root) {
  /** @type {THREE.Material[]} */
  const materials = []

  root.traverse((obj) => {
    const material = /** @type {THREE.Mesh} */ (obj).material
    if (!material) return
    if (Array.isArray(material)) {
      materials.push(...material)
    } else {
      materials.push(material)
    }
  })

  return [...new Set(materials)]
}

export class MugDragController {
  isDragging = false
  isPointerOver = false
  isSnapping = false
  isResetting = false
  isInteractionEnabled = true
  /** @type {string | null} */
  activeSourceId = null
  originPosition = new THREE.Vector3()
  dragDepth = 0
  /** @type {DropZoneHandle | null} */
  hoveredZone = null
  raycaster = new THREE.Raycaster()
  /** @type {{ material: THREE.Material, opacity: number, transparent: boolean, depthWrite: boolean }[] | null} */
  materialStates = null
  motionGeneration = 0
  resetGeneration = 0
  /** @type {{ generation: number, startPos: THREE.Vector3, target: THREE.Vector3, elapsedMs: number, durationMs: number } | null} */
  snapAnimation = null
  /** @type {{ generation: number, phase: 'fade-out' | 'fade-in', elapsedMs: number, durationMs: number, states: { material: THREE.Material, opacity: number, transparent: boolean, depthWrite: boolean }[], onComplete?: () => void } | null} */
  resetAnimation = null

  /**
   * @param {{ mugEl: MugEl, sceneEl: SceneEl, getDropZones: () => DropZoneHandle[], refreshInputRaycasters: () => void }} opts
   */
  constructor(opts) {
    this.opts = opts
    this.startPosition = opts.mugEl.object3D.position.clone()
    this.idleBasePosition = opts.mugEl.object3D.position.clone()
    this.idleScale = opts.mugEl.object3D.scale.clone()
  }

  /**
   * @param {DragInputEvent} event
   */
  handleInput(event) {
    switch (event.type) {
      case 'start':
        this.tryBeginDrag(event.ray, event.sourceId)
        break
      case 'move':
        if (this.isDragging && this.activeSourceId === event.sourceId) this.updateDragFromRay(event.ray)
        break
      case 'hover':
        if (!this.isDragging && this.isInteractionEnabled && !this.isSnapping && !this.isResetting) {
          this.updatePointerHoverFromRay(event.ray)
        }
        break
      case 'end':
        this.endDrag(event.sourceId)
        break
      case 'cancel':
        if (this.activeSourceId === event.sourceId) this.cancelDrag()
        break
    }
  }

  /**
   * @param {number} time
   * @param {number} delta
   */
  tick(time, delta) {
    if (this.updateResetAnimation(delta)) return
    if (this.updateSnapAnimation(delta)) return
    if (this.isDragging || this.isSnapping || this.isResetting) return

    const bob = Math.sin(time * MUG_IDLE_BOB_SPEED) * MUG_IDLE_BOB_HEIGHT
    this.opts.mugEl.object3D.position.set(
      this.idleBasePosition.x,
      this.idleBasePosition.y + bob,
      this.idleBasePosition.z,
    )
  }

  /**
   * @param {boolean} enabled
   */
  setInteractionEnabled(enabled) {
    this.isInteractionEnabled = enabled
    if (!enabled) {
      this.cancelDrag()
      this.isPointerOver = false
      this.setInteractiveVisual(false)
      this.setHoveredZone(null)
      this.setCanvasCursor('default')
    }
    this.syncRaycastable()
  }

  snapBack() {
    const target = this.originPosition.clone()
    const startPos = this.opts.mugEl.object3D.position.clone()
    const generation = ++this.motionGeneration
    this.isSnapping = true
    this.syncRaycastable()
    this.snapAnimation = {
      generation,
      startPos,
      target,
      elapsedMs: 0,
      durationMs: 300,
    }
  }

  /**
   * @param {() => void} [onComplete]
   */
  resetToStartWithFade(onComplete) {
    const generation = ++this.resetGeneration
    this.motionGeneration += 1
    this.snapAnimation = null
    this.resetAnimation = null
    this.restoreMaterialState()

    const states = this.getMaterialStates()
    this.isResetting = true
    this.isDragging = false
    this.isPointerOver = false
    this.isSnapping = false
    this.activeSourceId = null
    this.setHoveredZone(null)
    this.setInteractiveVisual(false)
    this.syncRaycastable()
    this.setCanvasCursor('default')

    if (states.length === 0) {
      this.moveToStart()
      this.isResetting = false
      this.syncRaycastable()
      onComplete?.()
      return
    }

    states.forEach(({ material }) => {
      material.transparent = true
      material.depthWrite = false
      material.needsUpdate = true
    })
    this.resetAnimation = {
      generation,
      phase: 'fade-out',
      elapsedMs: 0,
      durationMs: MUG_RESET_FADE_OUT_MS,
      states,
      onComplete,
    }
  }

  dispose() {
    this.resetGeneration += 1
    this.motionGeneration += 1
    this.snapAnimation = null
    this.resetAnimation = null
    this.restoreMaterialState()
    this.setHoveredZone(null)
    this.setRaycastable(true)
  }

  /**
   * @param {THREE.Ray} ray
   * @param {string} sourceId
   * @returns {boolean}
   */
  tryBeginDrag(ray, sourceId) {
    if (!this.isInteractionEnabled || this.isDragging || this.isSnapping || this.isResetting || this.opts.sceneEl.is('ui-open')) {
      return false
    }

    this.raycaster.ray.copy(ray)
    if (this.raycaster.intersectObjects(getUIButtons().map((el) => /** @type {any} */ (el).object3D), true).length > 0) {
      return false
    }
    if (this.raycaster.intersectObject(this.opts.mugEl.object3D, true).length === 0) return false

    this.opts.mugEl.object3D.position.copy(this.idleBasePosition)
    const worldPos = new THREE.Vector3()
    this.opts.mugEl.object3D.getWorldPosition(worldPos)
    this.originPosition.copy(worldPos)

    const pickupOffset = worldPos.clone().sub(ray.origin)
    this.dragDepth = Math.max(0.1, pickupOffset.dot(ray.direction))

    this.isDragging = true
    this.activeSourceId = sourceId
    this.setInteractiveVisual(true)
    this.syncRaycastable()
    this.setCanvasCursor('grabbing')
    return true
  }

  /**
   * @param {THREE.Ray} ray
   */
  updateDragFromRay(ray) {
    this.raycaster.ray.copy(ray)
    const zones = this.opts.getDropZones()
    const hits = this.raycaster.intersectObjects(zones.map((zone) => zone.hitMesh), false)

    /** @type {DropZoneHandle | null} */
    let newHovered = null
    if (hits.length > 0) {
      const hitMesh = /** @type {THREE.Mesh} */ (hits[0].object)
      const zone = zones.find((item) => item.hitMesh === hitMesh)
      if (zone) {
        newHovered = zone
        this.snapMugToZone(zone)
      }
    } else {
      const target = new THREE.Vector3()
      ray.at(this.dragDepth, target)
      this.opts.mugEl.object3D.position.copy(target)
    }

    this.setHoveredZone(newHovered)
  }

  /**
   * @param {string} sourceId
   */
  endDrag(sourceId) {
    if (!this.isDragging) return
    if (this.activeSourceId !== sourceId) return

    const droppedZone = this.hoveredZone
    this.isDragging = false
    this.activeSourceId = null
    this.setInteractiveVisual(false)
    if (droppedZone) {
      this.snapMugToZone(droppedZone)
      this.idleBasePosition.copy(this.opts.mugEl.object3D.position)
    }
    this.syncRaycastable()
    this.setCanvasCursor(this.isPointerOver ? 'grab' : 'default')
    this.opts.sceneEl.emit('drag-end', { el: this.opts.mugEl, hoveredZoneEl: droppedZone?.el ?? null })
    if (this.hoveredZone === droppedZone) this.setHoveredZone(null)
  }

  cancelDrag() {
    if (!this.isDragging) return
    this.isDragging = false
    this.activeSourceId = null
    this.opts.mugEl.object3D.position.copy(this.originPosition)
    this.idleBasePosition.copy(this.originPosition)
    this.setInteractiveVisual(false)
    this.setHoveredZone(null)
    this.syncRaycastable()
    this.setCanvasCursor('default')
  }

  /**
   * @param {THREE.Ray} ray
   */
  updatePointerHoverFromRay(ray) {
    this.raycaster.ray.copy(ray)
    if (this.raycaster.intersectObjects(getUIButtons().map((el) => /** @type {any} */ (el).object3D), true).length > 0) {
      if (this.isPointerOver) {
        this.isPointerOver = false
        this.setInteractiveVisual(false)
      }
      this.setCanvasCursor('default')
      return
    }

    const isPointerOver = this.raycaster.intersectObject(this.opts.mugEl.object3D, true).length > 0
    if (isPointerOver !== this.isPointerOver) {
      this.isPointerOver = isPointerOver
      this.setInteractiveVisual(isPointerOver)
      this.setCanvasCursor(isPointerOver ? 'grab' : 'default')
    }
  }

  /**
   * @param {DropZoneHandle | null} zone
   */
  setHoveredZone(zone) {
    if (zone === this.hoveredZone) return
    this.hoveredZone?.setHighlight(false)
    zone?.setHighlight(true)
    this.hoveredZone = zone
  }

  /**
   * @param {DropZoneHandle} zone
   */
  snapMugToZone(zone) {
    const zoneWorld = new THREE.Vector3()
    zone.el.object3D.getWorldPosition(zoneWorld)
    this.opts.mugEl.object3D.position.set(zoneWorld.x, zoneWorld.y + MUG_HOVER_OFFSET, zoneWorld.z)
  }

  /**
   * @param {string} cursor
   */
  setCanvasCursor(cursor) {
    this.opts.sceneEl.canvas.style.cursor = cursor
  }

  /**
   * @param {boolean} active
   */
  setInteractiveVisual(active) {
    const factor = active ? MUG_DRAG_SCALE_FACTOR : 1
    this.opts.mugEl.object3D.scale.copy(this.idleScale).multiplyScalar(factor)
  }

  syncRaycastable() {
    this.setRaycastable(this.isInteractionEnabled && !this.isDragging && !this.isSnapping && !this.isResetting)
  }

  /**
   * @param {boolean} active
   */
  setRaycastable(active) {
    this.opts.mugEl.classList.toggle(GRABBABLE_CLASS, active)
    this.opts.refreshInputRaycasters()
  }

  moveToStart() {
    this.opts.mugEl.object3D.position.copy(this.startPosition)
    this.idleBasePosition.copy(this.startPosition)
  }

  getMaterialStates() {
    if (!this.materialStates) {
      this.materialStates = getMeshMaterials(this.opts.mugEl.object3D).map((material) => ({
        material,
        opacity: material.opacity,
        transparent: material.transparent,
        depthWrite: material.depthWrite,
      }))
    }
    return this.materialStates
  }

  restoreMaterialState() {
    this.materialStates?.forEach(({ material, opacity, transparent, depthWrite }) => {
      material.opacity = opacity
      material.transparent = transparent
      material.depthWrite = depthWrite
      material.needsUpdate = true
    })
  }

  /**
   * @param {number} delta
   * @returns {boolean}
   */
  updateSnapAnimation(delta) {
    if (!this.snapAnimation) return false
    if (this.snapAnimation.generation !== this.motionGeneration) {
      this.snapAnimation = null
      return false
    }

    this.snapAnimation.elapsedMs += delta
    const t = Math.min(this.snapAnimation.elapsedMs / this.snapAnimation.durationMs, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    this.opts.mugEl.object3D.position.lerpVectors(this.snapAnimation.startPos, this.snapAnimation.target, eased)

    if (t >= 1) {
      this.idleBasePosition.copy(this.snapAnimation.target)
      this.snapAnimation = null
      this.isSnapping = false
      this.syncRaycastable()
    }
    return true
  }

  /**
   * @param {number} delta
   * @returns {boolean}
   */
  updateResetAnimation(delta) {
    if (!this.resetAnimation) return false
    if (this.resetAnimation.generation !== this.resetGeneration) {
      this.resetAnimation = null
      return false
    }

    this.resetAnimation.elapsedMs += delta
    const t = Math.min(this.resetAnimation.elapsedMs / this.resetAnimation.durationMs, 1)
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const fromFactor = this.resetAnimation.phase === 'fade-out' ? 1 : 0
    const toFactor = this.resetAnimation.phase === 'fade-out' ? 0 : 1
    const opacityFactor = THREE.MathUtils.lerp(fromFactor, toFactor, eased)

    this.resetAnimation.states.forEach(({ material, opacity }) => {
      material.opacity = opacity * opacityFactor
      material.needsUpdate = true
    })

    if (t < 1) return true

    if (this.resetAnimation.phase === 'fade-out') {
      this.moveToStart()
      this.resetAnimation = {
        ...this.resetAnimation,
        phase: 'fade-in',
        elapsedMs: 0,
        durationMs: MUG_RESET_FADE_IN_MS,
      }
      return true
    }

    const onComplete = this.resetAnimation.onComplete
    this.resetAnimation = null
    this.restoreMaterialState()
    this.isResetting = false
    this.syncRaycastable()
    onComplete?.()
    return true
  }
}
