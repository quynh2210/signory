/**
 * SIGNORY Web Audio Procedural Sound Synthesizer & Audio Player
 * Generates responsive, cheerful game audio without external asset dependencies,
 * and supports custom audio URLs when configured by Admin.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7; // 0.0 to 1.0
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  /**
   * Sound when answering correctly (Bright ascending triad C5 -> E5 -> G5)
   */
  playCorrect(customUrl = null) {
    if (!this.enabled) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Sound when answering incorrectly (Gentle friendly boing, non-punitive)
   */
  playIncorrect(customUrl = null) {
    if (!this.enabled) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.exponentialRampToValueAtTime(196.00, now + 0.22); // G3 (soft drop)

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Sound for Kids mode spelling letter reveal (Cute xylophone pop)
   */
  playLetter(pitchOffset = 0) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = 587.33; // D5
      const freq = baseFreq * Math.pow(1.059463, pitchOffset);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Letter audio error:', e);
    }
  }

  /**
   * Sound for lesson completion (Grand celebratory fanfare)
   */
  playComplete(customUrl = null) {
    if (!this.enabled) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Fanfare sequence: C5, E5, G5, pause, G5, C6 triumph
      const chords = [
        { freqs: [523.25, 659.25], start: 0, dur: 0.18 },
        { freqs: [659.25, 783.99], start: 0.18, dur: 0.18 },
        { freqs: [783.99, 1046.50], start: 0.36, dur: 0.22 },
        { freqs: [523.25, 659.25, 783.99, 1046.50], start: 0.62, dur: 0.6 }
      ];

      chords.forEach(chord => {
        chord.freqs.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + chord.start);

          gain.gain.setValueAtTime(0, now + chord.start);
          gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + chord.start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.start + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + chord.start);
          osc.stop(now + chord.start + chord.dur + 0.05);
        });
      });
    } catch (e) {
      console.warn('Complete fanfare error:', e);
    }
  }

  /**
   * Sound for unlocking a badge
   */
  playBadge() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1174.66, 1318.51]; // E5, A5, D6, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.4);
      });
    } catch (e) {
      console.warn('Badge sound error:', e);
    }
  }

  /**
   * Subtle UI click sound
   */
  playClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignored
    }
  }

  playCustomAudio(url) {
    if (!this.enabled || !url) return;
    try {
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.play().catch(e => console.warn('Custom audio playback failed:', e));
    } catch (e) {
      console.warn('Audio tag failed:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
