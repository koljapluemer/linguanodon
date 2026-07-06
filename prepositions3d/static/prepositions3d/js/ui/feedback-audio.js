// @ts-check

/** @typedef {'success' | 'error'} FeedbackSound */

export class FeedbackAudio {
  /**
   * @param {string} soundBaseUrl
   */
  constructor(soundBaseUrl) {
    /** @type {Record<FeedbackSound, HTMLAudioElement>} */
    this.audioBySound = {
      success: new Audio(`${soundBaseUrl}confirmation_001.ogg`),
      error: new Audio(`${soundBaseUrl}error_004.ogg`),
    }
    Object.values(this.audioBySound).forEach((audio) => {
      audio.preload = 'auto'
    })
  }

  /**
   * @param {FeedbackSound} sound
   */
  play(sound) {
    const audio = this.audioBySound[sound]
    this.stopOtherSounds(audio)
    audio.currentTime = 0
    void audio.play().catch(() => {
      // Browsers can block playback until audio is unlocked by a user gesture.
    })
  }

  /**
   * @param {HTMLAudioElement} activeAudio
   */
  stopOtherSounds(activeAudio) {
    Object.values(this.audioBySound).forEach((audio) => {
      if (audio === activeAudio) return
      audio.pause()
      audio.currentTime = 0
    })
  }
}
