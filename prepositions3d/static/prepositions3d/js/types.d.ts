export type ZoneId = string

export type GlossKey = string

export type LanguageCode = string

export type GameState = 'idle' | 'playing' | 'feedback'

export type Zone = {
  key: ZoneId
  pos: { x: number, y: number, z: number }
  glossKeys: GlossKey[]
}

export type Prepositions3dConfig = {
  modelsBaseUrl: string
  soundBaseUrl: string
  apiLanguagesUrl: string
  apiGlossaryUrl: string
}

export type InteractionMode = 'desktop' | 'vr'
export type TaskExecutionMode = InteractionMode | 'mixed'

// THREE.* types below are intentionally loose (bare identifiers, no import) -
// THREE is loaded globally via AFRAME.THREE at runtime (A-Frame's CDN UMD
// bundle), not as a local npm dependency, so its own type declarations
// aren't available for full checking here. Mirrors tprboard's board-scene.js.

export type DragInputEvent =
  | { type: 'start', sourceId: string, ray: THREE.Ray }
  | { type: 'move', sourceId: string, ray: THREE.Ray }
  | { type: 'hover', sourceId: string, ray: THREE.Ray }
  | { type: 'end', sourceId: string, ray: THREE.Ray }
  | { type: 'cancel', sourceId: string, reason: string }

export type DragInputAdapter = {
  dispose(): void
  tick?(time: number): void
}

export type SceneEl = Element & {
  canvas: HTMLCanvasElement
  camera: THREE.Camera
  emit(name: string, detail?: unknown): void
  is(name: string): boolean
}

export type MugEl = Element & {
  classList: DOMTokenList
  object3D: THREE.Object3D
  sceneEl: SceneEl
}

export type ControllerEl = Element & {
  id: string
  object3D: THREE.Object3D
  components: {
    raycaster?: {
      raycaster: THREE.Raycaster
      refreshObjects?: () => void
      updateOriginDirection: () => void
    }
  }
}

export type DropZoneEl = Element & {
  object3D: THREE.Object3D
}

export type DropZoneHandle = {
  el: DropZoneEl
  hitMesh: THREE.Mesh
  setHighlight(active: boolean): void
}
