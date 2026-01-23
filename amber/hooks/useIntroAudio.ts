// Audio stripped: keep hook API as no-ops.
import { useCallback } from 'react';

interface UseIntroAudioOptions {
  musicVolume: number;
  sfxVolume: number;
}

export const useIntroAudio = ({ musicVolume, sfxVolume }: UseIntroAudioOptions) => {
  void musicVolume;
  void sfxVolume;

  const playMenuSoundtrack = useCallback(() => {}, []);
  const fadeOutMenuSoundtrack = useCallback(async (_duration: number = 1000) => {}, []);
  const stopMenuSoundtrack = useCallback(() => {}, []);
  const playTextReceive = useCallback(() => {}, []);
  const playMessageSent = useCallback(() => {}, []);
  const playAmberAlert = useCallback(() => {}, []);
  const stopAmberAlert = useCallback(() => {}, []);
  const killAllAudio = useCallback(() => {}, []);

  return {
    playMenuSoundtrack,
    fadeOutMenuSoundtrack,
    stopMenuSoundtrack,
    playTextReceive,
    playMessageSent,
    playAmberAlert,
    stopAmberAlert,
    killAllAudio,
  };
};
