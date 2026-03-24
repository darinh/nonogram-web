export interface SoundProvider {
  playFill(): void;
  playCross(): void;
  playUndo(): void;
  playFanfare(): void;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
}
