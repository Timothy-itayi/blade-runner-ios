import React, { createContext, useContext, useMemo } from 'react';

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
  const contextValue = useMemo<GameAudioContextType>(() => ({
    playBootSequence: () => {},
    stopBootSequence: () => {},
    playButtonSound: () => {},
    playLoadingSound: () => {},
    playDecisionSound: () => {},
    playGameSoundtrack: () => {},
    stopGameSoundtrack: () => {},
    sfxEnabled: false,
    setSfxEnabled: () => {},
  }), []);

  return (
    <GameAudioContext.Provider value={contextValue}>
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
