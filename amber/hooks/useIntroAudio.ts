import { useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const AUDIO_FILES = {
  menuSoundtrack: require('../assets/news/anchor-narration/intro-music.mp3'),
  textReceive: require('../assets/sound-effects/main-menu/text-recieve-sound.mp3'),
  messageSent: require('../assets/sound-effects/main-menu/send-message.mp3'),
  amberAlert: require('../assets/sound-effects/main-menu/amber-alert.mp3'),
};

interface UseIntroAudioOptions {
  musicVolume: number;
  sfxVolume: number;
}

export const useIntroAudio = ({ musicVolume, sfxVolume }: UseIntroAudioOptions) => {
  const isInitialized = useRef(false);
  
  // Create audio players using hooks
  const menuPlayer = useAudioPlayer(AUDIO_FILES.menuSoundtrack);
  const textReceivePlayer = useAudioPlayer(AUDIO_FILES.textReceive);
  const messageSentPlayer = useAudioPlayer(AUDIO_FILES.messageSent);
  const amberAlertPlayer = useAudioPlayer(AUDIO_FILES.amberAlert);

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
        console.warn('Audio init failed:', e);
      }
    };
    
    initAudio();
  }, []);

  // Update volumes when settings change
  useEffect(() => {
    if (menuPlayer) {
      menuPlayer.volume = musicVolume * 0.4;
    }
  }, [musicVolume, menuPlayer]);

  useEffect(() => {
    if (textReceivePlayer) {
      textReceivePlayer.volume = sfxVolume * 0.6;
    }
    if (messageSentPlayer) {
      messageSentPlayer.volume = sfxVolume * 0.5;
    }
    if (amberAlertPlayer) {
      amberAlertPlayer.volume = sfxVolume * 0.7;
    }
  }, [sfxVolume, textReceivePlayer, messageSentPlayer, amberAlertPlayer]);

  // ─────────────────────────────────────────────────────────────
  // MENU SOUNDTRACK (loops)
  // ─────────────────────────────────────────────────────────────
  const playMenuSoundtrack = useCallback(() => {
    if (!menuPlayer) return;
    menuPlayer.loop = true;
    menuPlayer.volume = musicVolume * 0.4;
    menuPlayer.seekTo(0);
    menuPlayer.play();
  }, [menuPlayer, musicVolume]);

  const fadeOutMenuSoundtrack = useCallback(async (duration: number = 1000) => {
    if (!menuPlayer) return;
    
    try {
      const startVolume = menuPlayer.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      
      for (let i = steps; i >= 0; i--) {
        menuPlayer.volume = volumeStep * i;
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
      
      menuPlayer.pause();
    } catch (e) {
      console.warn('Fade out error:', e);
    }
  }, [menuPlayer]);

  const stopMenuSoundtrack = useCallback(() => {
    if (!menuPlayer) return;
    menuPlayer.pause();
  }, [menuPlayer]);

  // ─────────────────────────────────────────────────────────────
  // TEXT RECEIVE SOUND (incoming messages, starts at 1s mark)
  // ─────────────────────────────────────────────────────────────
  const playTextReceive = useCallback(() => {
    if (!textReceivePlayer) return;
    textReceivePlayer.volume = sfxVolume * 0.6;
    textReceivePlayer.seekTo(1); // Start at 1 second (louder part)
    textReceivePlayer.play();
  }, [textReceivePlayer, sfxVolume]);

  // ─────────────────────────────────────────────────────────────
  // MESSAGE SENT SOUND (outgoing messages)
  // ─────────────────────────────────────────────────────────────
  const playMessageSent = useCallback(() => {
    if (!messageSentPlayer) return;
    messageSentPlayer.volume = sfxVolume * 0.5;
    messageSentPlayer.seekTo(1); // Start at 1 second
    messageSentPlayer.play();
  }, [messageSentPlayer, sfxVolume]);

  // ─────────────────────────────────────────────────────────────
  // AMBER ALERT SOUND (loops until authenticate)
  // ─────────────────────────────────────────────────────────────
  const playAmberAlert = useCallback(() => {
    if (!amberAlertPlayer) return;
    amberAlertPlayer.loop = true;
    amberAlertPlayer.volume = sfxVolume * 0.7;
    amberAlertPlayer.seekTo(1); // Start at 1 second
    amberAlertPlayer.play();
  }, [amberAlertPlayer, sfxVolume]);

  const stopAmberAlert = useCallback(() => {
    if (!amberAlertPlayer) return;
    amberAlertPlayer.pause();
  }, [amberAlertPlayer]);

  // ─────────────────────────────────────────────────────────────
  // TAKEOVER - kill all audio abruptly
  // ─────────────────────────────────────────────────────────────
  const killAllAudio = useCallback(() => {
    if (menuPlayer) menuPlayer.pause();
    if (textReceivePlayer) textReceivePlayer.pause();
    if (messageSentPlayer) messageSentPlayer.pause();
    if (amberAlertPlayer) amberAlertPlayer.pause();
  }, [menuPlayer, textReceivePlayer, messageSentPlayer, amberAlertPlayer]);

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
