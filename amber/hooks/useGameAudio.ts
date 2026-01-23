// Audio stripped: keep hook API as no-ops.
import { useCallback } from 'react';

export const useGameAudio = () => {
  const playBootSequence = useCallback(() => {
    // no-op
  }, []);

  const stopBootSequence = useCallback(() => {
    // no-op
  }, []);

  const playButtonSound = useCallback(() => {
    // no-op
  }, []);

  const playLoadingSound = useCallback(() => {
    // no-op
  }, []);

  return {
    playBootSequence,
    stopBootSequence,
    playButtonSound,
    playLoadingSound,
  };
};
