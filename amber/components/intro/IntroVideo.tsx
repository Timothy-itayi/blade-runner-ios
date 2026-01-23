import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface IntroVideoProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds (defaults to audio length)
}

const { width, height } = Dimensions.get('window');

const INTRO_VIDEO = require('../../assets/videos/Amber-intro.mp4');
const AUDIO_DURATION = 32000; // Duration in milliseconds
const BUFFER_TIME = 1000; // Brief pause before boot
const LOGO_FADE_MS = 700;
const LOGO_HOLD_MS = 3000;
const QUOTE_SPEED_MS = 28;
const LETTER_FADE_MS = 200;
const LETTER_STAGGER_MS = 25;
const BUFFERING_MS = 2000;
const PREPLAY_FADE_MS = 600;
const PREPLAY_HOLD_MS = 1000;
const INTRO_QUOTE = 'Securing identity. Protecting tomorrow.';
const INTRO_LOGO = require('../../assets/app-icon.png');
export const IntroVideo = ({ onComplete, duration = AUDIO_DURATION }: IntroVideoProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState<'logo' | 'quote' | 'fadeLetters' | 'buffering' | 'preplay' | 'play'>('logo');
  const [typedQuote, setTypedQuote] = useState('');
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const letterOpacitiesRef = useRef<Animated.Value[]>([]);
  const videoPlayer = useVideoPlayer(INTRO_VIDEO, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    if (phase !== 'play') return;
    progressAnim.setValue(0);
    videoPlayer.play();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration + BUFFER_TIME);

    return () => clearTimeout(completeTimer);
  }, [phase, duration, onComplete, videoPlayer]);

  useEffect(() => {
    if (phase !== 'logo') return;
    logoOpacity.setValue(0);
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: LOGO_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => setPhase('quote'), LOGO_HOLD_MS);
      return () => clearTimeout(timer);
    });
  }, [phase, logoOpacity]);

  useEffect(() => {
    if (phase !== 'quote') return;
    setTypedQuote('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedQuote(INTRO_QUOTE.slice(0, index));
      if (index >= INTRO_QUOTE.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('fadeLetters'), 200);
      }
    }, QUOTE_SPEED_MS);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fadeLetters') return;
    const opacities = INTRO_QUOTE.split('').map(() => new Animated.Value(1));
    letterOpacitiesRef.current = opacities;
    Animated.stagger(
      LETTER_STAGGER_MS,
      opacities.map((val) =>
        Animated.timing(val, {
          toValue: 0,
          duration: LETTER_FADE_MS,
          useNativeDriver: true,
        })
      )
    ).start(() => {
      setPhase('buffering');
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'buffering') return;
    const timer = setTimeout(() => setPhase('preplay'), BUFFERING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'preplay') return;
    videoOpacity.setValue(0);
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: PREPLAY_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => setPhase('play'), PREPLAY_HOLD_MS);
      return () => clearTimeout(timer);
    });
  }, [phase, videoOpacity]);

  const quoteLetters = useMemo(() => INTRO_QUOTE.split(''), []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.stageWrapper}>
        {phase !== 'play' && (
          <View style={styles.introStage}>
          {phase === 'logo' && (
            <Animated.Image source={INTRO_LOGO} style={[styles.logo, { opacity: logoOpacity }]} />
          )}
          {phase === 'quote' && (
            <Text style={styles.quoteText}>{typedQuote}</Text>
          )}
          {phase === 'fadeLetters' && (
            <View style={styles.quoteRow}>
              {quoteLetters.map((char, idx) => (
                <Animated.Text
                  key={`${char}-${idx}`}
                  style={[
                    styles.quoteText,
                    { opacity: letterOpacitiesRef.current[idx] || 1 },
                  ]}
                >
                  {char}
                </Animated.Text>
              ))}
            </View>
          )}
          {phase === 'buffering' && (
            <Text style={styles.bufferingText}>BUFFERING...</Text>
          )}
          </View>
        )}

        {(phase === 'preplay' || phase === 'play') && (
          <Animated.View style={[styles.videoContainer, { opacity: videoOpacity }]}>
            <VideoView
              style={styles.video}
              player={videoPlayer}
              contentFit="cover"
              nativeControls={false}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          </Animated.View>
        )}
      </View>

      {/* Progress Bar under video */}
      {phase === 'play' && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: progressWidth }
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    position: 'relative',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageWrapper: {
    width: Math.min(width, height) * 0.9,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 12,
    color: '#d9c7b0',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bufferingText: {
    fontSize: 12,
    color: '#d9c7b0',
    letterSpacing: 2,
    marginTop: 10,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.8 }, { translateY: -20 }],
  },
  progressBarContainer: {
    width: Math.min(width, height) * 0.6,
    marginTop: 12,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFA500', // Amber/orange color to match AMBER branding
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
