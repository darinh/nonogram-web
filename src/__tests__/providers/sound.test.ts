import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebAudioSoundProvider } from '../../providers/sound/WebAudioSoundProvider';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  });
});

describe('WebAudioSoundProvider', () => {
  it('constructor does not throw', () => {
    expect(() => new WebAudioSoundProvider()).not.toThrow();
  });

  it('isMuted() returns false by default', () => {
    const provider = new WebAudioSoundProvider();
    expect(provider.isMuted()).toBe(false);
  });

  it('setMuted(true) makes isMuted() return true', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(provider.isMuted()).toBe(true);
  });

  it('setMuted persists to localStorage', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(mockStorage['nonogram_sound_muted']).toBe('true');
    provider.setMuted(false);
    expect(mockStorage['nonogram_sound_muted']).toBe('false');
  });

  it('reads muted state from localStorage on construction', () => {
    mockStorage['nonogram_sound_muted'] = 'true';
    const provider = new WebAudioSoundProvider();
    expect(provider.isMuted()).toBe(true);
  });

  it('playFill does not throw when muted', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(() => provider.playFill()).not.toThrow();
  });

  it('playCross does not throw when muted', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(() => provider.playCross()).not.toThrow();
  });

  it('playUndo does not throw when muted', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(() => provider.playUndo()).not.toThrow();
  });

  it('playFanfare does not throw when muted', () => {
    const provider = new WebAudioSoundProvider();
    provider.setMuted(true);
    expect(() => provider.playFanfare()).not.toThrow();
  });

  it('play methods do not throw when AudioContext is unavailable', () => {
    const provider = new WebAudioSoundProvider();
    // AudioContext is not available in jsdom, so these should gracefully no-op
    expect(() => provider.playFill()).not.toThrow();
    expect(() => provider.playCross()).not.toThrow();
    expect(() => provider.playUndo()).not.toThrow();
    expect(() => provider.playFanfare()).not.toThrow();
  });
});
