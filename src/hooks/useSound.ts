import { useSoundProvider } from '../providers/useProviders';

export function useSound() {
  const soundProvider = useSoundProvider();
  return {
    playFill: () => soundProvider.playFill(),
    playCross: () => soundProvider.playCross(),
    playUndo: () => soundProvider.playUndo(),
    playFanfare: () => soundProvider.playFanfare(),
    muted: soundProvider.isMuted(),
    setMuted: (m: boolean) => soundProvider.setMuted(m),
    toggleMute: () => soundProvider.setMuted(!soundProvider.isMuted()),
  };
}
