import { useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const AUDIO_FILES = {
  bootSequence: require('../assets/sound-effects/main-menu/boot-sequence.mp3'),
  uiButton: require('../assets/sound-effects/main-menu/digital-interface.mp3'),
  uiLoading: require('../assets/sound-effects/main-menu/main-ui-loading.mp3'),
};

export const useGameAudio = () => {
  const isInitialized = useRef(false);
  
  // Create audio players
  const bootSequencePlayer = useAudioPlayer(AUDIO_FILES.bootSequence);
  const uiButtonPlayer = useAudioPlayer(AUDIO_FILES.uiButton);
  const uiLoadingPlayer = useAudioPlayer(AUDIO_FILES.uiLoading);

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

  // ─────────────────────────────────────────────────────────────
  // BOOT SEQUENCE SOUND
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // UI BUTTON SOUND (for main game interface buttons)
  // ─────────────────────────────────────────────────────────────
  const playButtonSound = useCallback(() => {
    if (!uiButtonPlayer) return;
    uiButtonPlayer.volume = 0.9;
    uiButtonPlayer.seekTo(1);
    uiButtonPlayer.play();
  }, [uiButtonPlayer]);

  // ─────────────────────────────────────────────────────────────
  // UI LOADING SOUND (for "begin shift" and major transitions)
  // ─────────────────────────────────────────────────────────────
  const playLoadingSound = useCallback(() => {
    if (!uiLoadingPlayer) return;
    uiLoadingPlayer.volume = 0.5;
    uiLoadingPlayer.seekTo(0);
    uiLoadingPlayer.play();
  }, [uiLoadingPlayer]);

  return {
    playBootSequence,
    stopBootSequence,
    playButtonSound,
    playLoadingSound,
  };
};
