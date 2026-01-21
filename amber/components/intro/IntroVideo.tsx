import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

interface IntroVideoProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds (defaults to audio length)
}

const { width, height } = Dimensions.get('window');

const INTRO_AUDIO = require('../../assets/amber-intro.mp3');
const AUDIO_DURATION = 51000; // 51 seconds in milliseconds
const BUFFER_TIME = 2000; // 2 seconds buffer after audio
const GLITCH_DURATION = 800; // Glitch effect duration

export const IntroVideo = ({ onComplete, duration = AUDIO_DURATION }: IntroVideoProps) => {
  const [progress, setProgress] = useState(0);
  const [showGlitch, setShowGlitch] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glitchOffset = useRef(new Animated.Value(0)).current;
  const interferenceOpacity = useRef(new Animated.Value(0)).current;
  const blackoutOpacity = useRef(new Animated.Value(0)).current;
  const audioPlayer = useAudioPlayer(INTRO_AUDIO);

  useEffect(() => {
    // Play audio when component mounts
    if (audioPlayer) {
      audioPlayer.volume = 0.7;
      audioPlayer.loop = false;
      audioPlayer.seekTo(0);
      audioPlayer.play();
    }

    // Animate progress bar from 0 to 100% over audio duration
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Update progress value for display
    const listener = progressAnim.addListener(({ value }) => {
      setProgress(value);
    });

    // After audio finishes, wait 2 seconds, then start glitch effect
    const glitchStartTime = duration + BUFFER_TIME;
    const glitchTimer = setTimeout(() => {
      setShowGlitch(true);
      runGlitchSequence();
    }, glitchStartTime);

    // Complete after glitch effect
    const completeTimer = setTimeout(() => {
      // Don't try to pause if native object is gone
      try {
        if (audioPlayer && audioPlayer.playing !== undefined) {
          audioPlayer.pause();
        }
      } catch (e) {
        // Ignore errors if native object is already gone
      }
      onComplete();
    }, glitchStartTime + GLITCH_DURATION);

    return () => {
      progressAnim.removeListener(listener);
      clearTimeout(glitchTimer);
      clearTimeout(completeTimer);
      // Don't try to pause if native object is gone
      try {
        if (audioPlayer && audioPlayer.playing !== undefined) {
          audioPlayer.pause();
        }
      } catch (e) {
        // Ignore errors if native object is already gone
      }
    };
  }, [duration, onComplete, audioPlayer]);

  const runGlitchSequence = () => {
    Animated.sequence([
      // Glitch offset animation
      Animated.sequence([
        Animated.timing(glitchOffset, { toValue: 12, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchOffset, { toValue: -8, duration: 35, useNativeDriver: true }),
        Animated.timing(glitchOffset, { toValue: 5, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchOffset, { toValue: -3, duration: 30, useNativeDriver: true }),
        Animated.timing(glitchOffset, { toValue: 0, duration: 25, useNativeDriver: true }),
      ]),
      // Interference and blackout
      Animated.parallel([
        Animated.sequence([
          Animated.timing(interferenceOpacity, { toValue: 0.8, duration: 60, useNativeDriver: true }),
          Animated.timing(interferenceOpacity, { toValue: 0.2, duration: 50, useNativeDriver: true }),
          Animated.timing(interferenceOpacity, { toValue: 0.6, duration: 55, useNativeDriver: true }),
          Animated.timing(blackoutOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* News Report Background Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          showGlitch && { transform: [{ translateX: glitchOffset }] }
        ]}
      >
        <Image
          source={require('../../assets/news-report.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Glitch Effects */}
      {showGlitch && (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.interferenceOverlay,
              { opacity: interferenceOpacity }
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.blackoutOverlay,
              { opacity: blackoutOpacity }
            ]}
          />
        </>
      )}

      {/* Progress Bar at Bottom */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progressWidth }
          ]}
        />
      </View>
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
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  interferenceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.6,
    zIndex: 5,
  },
  blackoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 6,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
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
