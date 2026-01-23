import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface UseIntroAudioOptions {
  musicVolume: number;
  sfxVolume: number;
}

export const useIntroAudio = ({ musicVolume, sfxVolume }: UseIntroAudioOptions) => {
  const menuSoundtrackRef = useRef<Audio.Sound | null>(null);
  const alertSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      menuSoundtrackRef.current?.unloadAsync();
      alertSoundRef.current?.unloadAsync();
    };
  }, []);

  const playMenuSoundtrack = useCallback(async () => {
    try {
      if (menuSoundtrackRef.current) {
        await menuSoundtrackRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/menu-soundtrack.mp3'),
        { isLooping: true, volume: musicVolume }
      );
      menuSoundtrackRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to play menu soundtrack:', e);
    }
  }, [musicVolume]);

  const fadeOutMenuSoundtrack = useCallback(async (duration: number = 1000) => {
    if (!menuSoundtrackRef.current) return;
    try {
      const steps = 10;
      const interval = duration / steps;
      for (let i = steps; i >= 0; i--) {
        await menuSoundtrackRef.current.setVolumeAsync((i / steps) * musicVolume);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      await menuSoundtrackRef.current.stopAsync();
      await menuSoundtrackRef.current.unloadAsync();
      menuSoundtrackRef.current = null;
    } catch (e) {
      console.warn('Failed to fade out menu soundtrack:', e);
    }
  }, [musicVolume]);

  const stopMenuSoundtrack = useCallback(async () => {
    try {
      if (menuSoundtrackRef.current) {
        await menuSoundtrackRef.current.stopAsync();
        await menuSoundtrackRef.current.unloadAsync();
        menuSoundtrackRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop menu soundtrack:', e);
    }
  }, []);

  const playTextReceive = useCallback(async () => {
    if (sfxVolume === 0) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/text-recieve-sound.mp3'),
        { volume: sfxVolume }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play text receive:', e);
    }
  }, [sfxVolume]);

  const playMessageSent = useCallback(async () => {
    if (sfxVolume === 0) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/send-message.mp3'),
        { volume: sfxVolume }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play message sent:', e);
    }
  }, [sfxVolume]);

  const playAmberAlert = useCallback(async () => {
    try {
      if (alertSoundRef.current) {
        await alertSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/amber-alert.mp3'),
        { volume: sfxVolume }
      );
      alertSoundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to play amber alert:', e);
    }
  }, [sfxVolume]);

  const stopAmberAlert = useCallback(async () => {
    try {
      if (alertSoundRef.current) {
        await alertSoundRef.current.stopAsync();
        await alertSoundRef.current.unloadAsync();
        alertSoundRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop amber alert:', e);
    }
  }, []);

  const killAllAudio = useCallback(async () => {
    try {
      await menuSoundtrackRef.current?.stopAsync();
      await menuSoundtrackRef.current?.unloadAsync();
      menuSoundtrackRef.current = null;
      
      await alertSoundRef.current?.stopAsync();
      await alertSoundRef.current?.unloadAsync();
      alertSoundRef.current = null;
    } catch (e) {
      console.warn('Failed to kill all audio:', e);
    }
  }, []);

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
