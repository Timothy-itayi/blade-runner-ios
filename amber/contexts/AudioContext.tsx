import React, { createContext, useContext, useCallback, useState } from 'react';

interface GameAudioContextType {
  playBootSequence: () => void;
  stopBootSequence: () => void;
  playButtonSound: () => void;
  playLoadingSound: () => void;
  playGameSoundtrack: () => void;
  stopGameSoundtrack: () => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
}

const GameAudioContext = createContext<GameAudioContextType | null>(null);

export const GameAudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const playBootSequence = useCallback(() => {
    // Audio stripped.
    void sfxEnabled;
  }, [sfxEnabled]);

  const stopBootSequence = useCallback(() => {
    // Audio stripped.
  }, []);

  const playButtonSound = useCallback(() => {
    // Audio stripped.
    void sfxEnabled;
  }, [sfxEnabled]);

  const playLoadingSound = useCallback(() => {
    // Audio stripped.
    void sfxEnabled;
  }, [sfxEnabled]);

  const playGameSoundtrack = useCallback(() => {
    // Audio stripped.
  }, []);

  const stopGameSoundtrack = useCallback(() => {
    // Audio stripped.
  }, []);

  return (
    <GameAudioContext.Provider value={{
      playBootSequence,
      stopBootSequence,
      playButtonSound,
      playLoadingSound,
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
    // Return no-op functions if used outside provider (for safety)
    return {
      playBootSequence: () => {},
      stopBootSequence: () => {},
      playButtonSound: () => {},
      playLoadingSound: () => {},
      playGameSoundtrack: () => {},
      stopGameSoundtrack: () => {},
      sfxEnabled: true,
      setSfxEnabled: () => {},
    };
  }
  return context;
};
