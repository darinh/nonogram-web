import type { SoundProvider } from './SoundProvider';

const STORAGE_KEY = 'nonogram_sound_muted';

export class WebAudioSoundProvider implements SoundProvider {
  private audioContext: AudioContext | null = null;
  private muted: boolean;

  constructor() {
    this.muted = this.readMutedFromStorage();
  }

  private readMutedFromStorage(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.audioContext) return this.audioContext;
    try {
      this.audioContext = new AudioContext();
      return this.audioContext;
    } catch {
      return null;
    }
  }

  playFill(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  playCross(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  playUndo(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playFanfare(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    const noteDuration = 0.1;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const startTime = ctx.currentTime + i * noteDuration;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(muted));
      }
    } catch {
      // localStorage unavailable — keep in-memory flag only
    }
  }

  isMuted(): boolean {
    return this.muted;
  }
}
