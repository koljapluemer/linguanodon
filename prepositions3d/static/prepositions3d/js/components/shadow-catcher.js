// @ts-check
// THREE is exposed globally via AFRAME.THREE at runtime - see the note in
// components/mouse-look-limited.js.
const THREE = AFRAME.THREE

export function registerShadowCatcher() {
  if (AFRAME.components['shadow-catcher']) return

  AFRAME.registerComponent('shadow-catcher', {
    schema: {
      opacity: { type: 'number', default: 0.35 },
    },

    init() {
      this.el.addEventListener('object3dset', () => this._applyMaterial())
      this._applyMaterial()
    },

    _applyMaterial() {
      const mesh = this.el.getObject3D('mesh')
      if (!mesh) return
      mesh.material = new THREE.ShadowMaterial({ opacity: this.data.opacity })
      mesh.receiveShadow = true
    },
  })
}
