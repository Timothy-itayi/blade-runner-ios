import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const AUDIO_FILES = {
  bootSequence: require('../assets/sound-effects/main-menu/boot-sequence.mp3'),
  uiButton: require('../assets/sound-effects/main-menu/digital-interface.mp3'),
  uiLoading: require('../assets/sound-effects/main-menu/main-ui-loading.mp3'),
  gameSoundtrack: require('../assets/sound-effects/main-menu/main-game-soundtrack.mp3'),
};

interface GameAudioContextType {
  playBootSequence: () => void;
  stopBootSequence: () => void;
  playButtonSound: () => void;
  playLoadingSound: () => void;
  playGameSoundtrack: () => void;
  stopGameSoundtrack: () => void;
}

const GameAudioContext = createContext<GameAudioContextType | null>(null);

export const GameAudioProvider = ({ children }: { children: React.ReactNode }) => {
  const isInitialized = useRef(false);
  
  // Create audio players
  const bootSequencePlayer = useAudioPlayer(AUDIO_FILES.bootSequence);
  const uiButtonPlayer = useAudioPlayer(AUDIO_FILES.uiButton);
  const uiLoadingPlayer = useAudioPlayer(AUDIO_FILES.uiLoading);
  const gameSoundtrackPlayer = useAudioPlayer(AUDIO_FILES.gameSoundtrack);

  // Initialize audio mode
  useEffect(() => {
    const initAudio = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;
      
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
        });
      } catch (e) {
        console.warn('Game audio init failed:', e);
      }
    };
    
    initAudio();
  }, []);

  const playBootSequence = useCallback(() => {
    if (!bootSequencePlayer) return;
    bootSequencePlayer.volume = 0.5;
    bootSequencePlayer.loop = false;
    bootSequencePlayer.seekTo(0);
    bootSequencePlayer.play();
  }, [bootSequencePlayer]);

  const stopBootSequence = useCallback(() => {
    if (!bootSequencePlayer) return;
    bootSequencePlayer.pause();
  }, [bootSequencePlayer]);

  const playButtonSound = useCallback(() => {
    if (!uiButtonPlayer) return;
    uiButtonPlayer.volume = 1.0; // Max volume
    uiButtonPlayer.seekTo(0.9);
    uiButtonPlayer.play();
  }, [uiButtonPlayer]);

  const playLoadingSound = useCallback(() => {
    if (!uiLoadingPlayer) return;
    uiLoadingPlayer.volume = 0.5;
    uiLoadingPlayer.seekTo(0);
    uiLoadingPlayer.play();
  }, [uiLoadingPlayer]);

  const playGameSoundtrack = useCallback(() => {
    if (!gameSoundtrackPlayer) return;
    gameSoundtrackPlayer.loop = true;
    gameSoundtrackPlayer.volume = 0.35;
    gameSoundtrackPlayer.seekTo(0);
    gameSoundtrackPlayer.play();
  }, [gameSoundtrackPlayer]);

  const stopGameSoundtrack = useCallback(() => {
    if (!gameSoundtrackPlayer) return;
    gameSoundtrackPlayer.pause();
  }, [gameSoundtrackPlayer]);

  return (
    <GameAudioContext.Provider value={{
      playBootSequence,
      stopBootSequence,
      playButtonSound,
      playLoadingSound,
      playGameSoundtrack,
      stopGameSoundtrack,
    }}>
      {children}
    </GameAudioContext.Provider>
  );
};

export const useGameAudioContext = () => {
  const context = useContext(GameAudioContext);
  if (!context) {
    // Return no-op functions if used outside provider (for safety)
    return {
      playBootSequence: () => {},
      stopBootSequence: () => {},
      playButtonSound: () => {},
      playLoadingSound: () => {},
      playGameSoundtrack: () => {},
      stopGameSoundtrack: () => {},
    };
  }
  return context;
};
