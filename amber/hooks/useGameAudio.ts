import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useGameAudio = () => {
  const bootSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      bootSoundRef.current?.unloadAsync();
    };
  }, []);

  const playBootSequence = useCallback(async () => {
    try {
      if (bootSoundRef.current) {
        await bootSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/boot-sequence.mp3')
      );
      bootSoundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to play boot sequence:', e);
    }
  }, []);

  const stopBootSequence = useCallback(async () => {
    try {
      if (bootSoundRef.current) {
        await bootSoundRef.current.stopAsync();
        await bootSoundRef.current.unloadAsync();
        bootSoundRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop boot sequence:', e);
    }
  }, []);

  const playButtonSound = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/main-ui-button.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play button sound:', e);
    }
  }, []);

  const playLoadingSound = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/main-ui-loading.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play loading sound:', e);
    }
  }, []);

  return {
    playBootSequence,
    stopBootSequence,
    playButtonSound,
    playLoadingSound,
  };
};
