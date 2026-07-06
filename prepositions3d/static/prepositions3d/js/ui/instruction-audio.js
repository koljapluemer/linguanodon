// @ts-check

export class InstructionAudio {
  audio = document.createElement('audio')
  /** @type {string | null} */
  audioUrl = null
  unlocked = false

  constructor() {
    this.audio.preload = 'auto'
  }

  /**
   * @param {string | null} audioUrl
   */
  setSource(audioUrl) {
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.audioUrl = audioUrl

    if (!audioUrl) return

    this.audio.src = audioUrl
    this.audio.load()
  }

  /** @returns {boolean} */
  hasAudio() {
    return this.audioUrl !== null
  }

  /** @returns {boolean} */
  isUnlocked() {
    return this.unlocked
  }

  /** @returns {Promise<boolean>} */
  async replay() {
    if (!this.audioUrl) return false

    try {
      this.audio.currentTime = 0
      await this.audio.play()
      this.unlocked = true
      return true
    } catch {
      // Browsers can block playback until the player explicitly presses replay.
      return false
    }
  }
}
