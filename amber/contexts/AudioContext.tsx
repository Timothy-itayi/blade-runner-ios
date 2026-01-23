import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface GameAudioContextType {
  playBootSequence: () => void;
  stopBootSequence: () => void;
  playButtonSound: () => void;
  playLoadingSound: () => void;
  playDecisionSound: () => void;
  playGameSoundtrack: () => void;
  stopGameSoundtrack: () => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
}

const GameAudioContext = createContext<GameAudioContextType | null>(null);

export const GameAudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const bootSoundRef = useRef<Audio.Sound | null>(null);
  const soundtrackRef = useRef<Audio.Sound | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bootSoundRef.current?.unloadAsync();
      soundtrackRef.current?.unloadAsync();
    };
  }, []);

  const playBootSequence = useCallback(async () => {
    if (!sfxEnabled) return;
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
  }, [sfxEnabled]);

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
    if (!sfxEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/main-ui-button.mp3')
      );
      await sound.playAsync();
      // Auto-unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play button sound:', e);
    }
  }, [sfxEnabled]);

  const playLoadingSound = useCallback(async () => {
    if (!sfxEnabled) return;
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
  }, [sfxEnabled]);

  const playDecisionSound = useCallback(async () => {
    if (!sfxEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/digital-interface.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Failed to play decision sound:', e);
    }
  }, [sfxEnabled]);

  const playGameSoundtrack = useCallback(async () => {
    try {
      if (soundtrackRef.current) {
        await soundtrackRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound-effects/main-menu/main-game-soundtrack.mp3'),
        { isLooping: true, volume: 0.3 }
      );
      soundtrackRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to play game soundtrack:', e);
    }
  }, []);

  const stopGameSoundtrack = useCallback(async () => {
    try {
      if (soundtrackRef.current) {
        await soundtrackRef.current.stopAsync();
        await soundtrackRef.current.unloadAsync();
        soundtrackRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop game soundtrack:', e);
    }
  }, []);

  return (
    <GameAudioContext.Provider value={{
      playBootSequence,
      stopBootSequence,
      playButtonSound,
      playLoadingSound,
      playDecisionSound,
      playGameSoundtrack,
      stopGameSoundtrack,
      sfxEnabled,
      setSfxEnabled,
    }}>
      {children}
    </GameAudioContext.Provider>
  );
};

export const useGameAudioContext = () => {
  const context = useContext(GameAudioContext);
  if (!context) {
    return {
      playBootSequence: () => {},
      stopBootSequence: () => {},
      playButtonSound: () => {},
      playLoadingSound: () => {},
      playDecisionSound: () => {},
      playGameSoundtrack: () => {},
      stopGameSoundtrack: () => {},
      sfxEnabled: true,
      setSfxEnabled: () => {},
    };
  }
  return context;
};
