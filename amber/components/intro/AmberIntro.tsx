import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { Theme } from '../../constants/theme';
import { useIntroAudio } from '../../hooks/useIntroAudio';

const INTRO_SLIDE = require('../../assets/news/anchor-narration/intro-slide.png');
const INTRO_SLIDE1 = require('../../assets/news/anchor-narration/intro-slide1.png');
const INTRO_SLIDE2 = require('../../assets/news/anchor-narration/intro-slide2.png');
const INTRO_SLIDE3 = require('../../assets/news/anchor-narration/intro-slide3.png');
const INTRO_NARRATION = require('../../assets/news/anchor-narration/intro-narration.mp3');

const INTRO_SLIDES = [INTRO_SLIDE, INTRO_SLIDE1, INTRO_SLIDE2, INTRO_SLIDE3];
const SLIDE_DURATION = 12000; // 12 seconds per slide

// Script segments timed to the audio narration
const NARRATION_SEGMENTS = [
  {
    text: "Welcome to AMBER: the Automated Movement and Biometric Evaluation Registry.",
    startTime: 0,
    duration: 5000,
  },
  {
    text: "In our pursuit of systemic stability, we oversee the safe passage of subjects across established sector lines.",
    startTime: 5000,
    duration: 6000,
  },
  {
    text: "Your directive is simple: Confirm. Evaluate. And either Approve or Deny.",
    startTime: 11000,
    duration: 5500,
  },
  {
    text: "Through advanced retinal analysis and real-time biometric monitoring, you will identify discrepancies where the naked eye cannot.",
    startTime: 16500,
    duration: 7000,
  },
  {
    text: "Every evaluation is a permanent entry in our global registry.",
    startTime: 23500,
    duration: 4000,
  },
  {
    text: "Every decision you make ensures the integrity of the network and the safety of the civilian population.",
    startTime: 27500,
    duration: 6000,
  },
  {
    text: "At AMBER, we are securing identity and protecting tomorrow.",
    startTime: 33500,
    duration: 5000,
  },
  {
    text: "Your shift begins now.",
    startTime: 38500,
    duration: 3500,
  },
];

const TOTAL_DURATION = 44000; // Total narration duration in ms

interface AmberIntroProps {
  onComplete: () => void;
}

export const AmberIntro = ({ onComplete }: AmberIntroProps) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  // Narration audio player (voice-over)
  const narrationPlayer = useAudioPlayer(INTRO_NARRATION);

  // Intro music control (to fade out when done)
  const { fadeOutMenuSoundtrack } = useIntroAudio({ musicVolume: 1, sfxVolume: 1 });

  // Initial fade in animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPlaying(true);
      // Start narration audio (voice-over on top of music)
      try {
        if (narrationPlayer) {
          narrationPlayer.volume = 0.9;
          narrationPlayer.play();
        }
      } catch (e) {
        // Continue without audio
      }
    });

    // Scan line animation loop - cleaner, slower
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Allow skip after 3 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 3000);

    return () => {
      clearTimeout(skipTimer);
      try {
        if (narrationPlayer && narrationPlayer.playing) {
          narrationPlayer.pause();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Slide rotation - 12 seconds per slide
  useEffect(() => {
    if (!isPlaying) return;

    const slideInterval = setInterval(() => {
      // Fade out current slide, change image, then fade in
      Animated.timing(slideOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change slide during fade out
        setCurrentSlideIndex(prev => (prev + 1) % INTRO_SLIDES.length);
        // Fade in new slide
        Animated.timing(slideOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, SLIDE_DURATION);

    return () => clearInterval(slideInterval);
  }, [isPlaying]);

  // Segment timing
  useEffect(() => {
    if (!isPlaying) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Schedule each segment
    NARRATION_SEGMENTS.forEach((segment, index) => {
      const timer = setTimeout(() => {
        // Fade out current text
        Animated.timing(textFade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setCurrentSegmentIndex(index);
          // Fade in new text
          Animated.timing(textFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });
      }, segment.startTime);
      timers.push(timer);
    });

    // Schedule completion
    const completeTimer = setTimeout(() => {
      handleComplete();
    }, TOTAL_DURATION);
    timers.push(completeTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [isPlaying]);

  // Initial text fade in
  useEffect(() => {
    if (isPlaying) {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  const handleComplete = () => {
    // Stop narration
    try {
      if (narrationPlayer && narrationPlayer.playing) {
        narrationPlayer.pause();
      }
    } catch (e) {
      // Ignore errors
    }

    // Fade out intro music before transitioning to boot
    fadeOutMenuSoundtrack(1000);

    // Fade out visuals before completing
    Animated.timing(fadeIn, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  const handleSkip = () => {
    if (canSkip) {
      handleComplete();
    }
  };

  const currentSegment = NARRATION_SEGMENTS[currentSegmentIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Background gradient */}
        <View style={styles.backgroundGradient} />

        {/* TV-style display with thick bezels */}
        <View style={styles.tvContainer}>
          {/* TV bezel (thick black border) */}
          <View style={styles.tvBezel}>
            {/* TV screen area */}
            <View style={styles.tvScreen}>
              <Animated.View style={[styles.slideContainer, { opacity: slideOpacity }]}>
                <Image
                  source={INTRO_SLIDES[currentSlideIndex]}
                  style={styles.introImage}
                  contentFit="cover"
                />
              </Animated.View>

              {/* Cleaner scan line effect */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: scanLine.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 240], // Match tvScreen height
                      }),
                    }],
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* AMBER title */}
        <View style={styles.titleContainer}>
          <Text style={styles.amberTitle}>AMBER</Text>
          <Text style={styles.amberSubtitle}>
            Automated Movement & Biometric Evaluation Registry
          </Text>
        </View>

        {/* Narration text */}
        <Animated.View style={[styles.narrationContainer, { opacity: textFade }]}>
          <Text style={styles.narrationText}>
            "{currentSegment.text}"
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${((currentSegmentIndex + 1) / NARRATION_SEGMENTS.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Skip button */}
        {canSkip && (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed,
            ]}
          >
            <Text style={styles.skipText}>[ SKIP ]</Text>
          </Pressable>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SECTOR TRANSIT AUTHORITY • EMPLOYEE ORIENTATION
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.bgDark,
  },
  tvContainer: {
    width: '90%',
    maxWidth: 400,
    marginBottom: 32,
    alignItems: 'center',
  },
  tvBezel: {
    width: '100%',
    backgroundColor: '#000000',
    padding: 20, // Thick bezel like 2000s TV
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  tvScreen: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 2,
  },
  slideContainer: {
    width: '100%',
    height: '100%',
  },
  introImage: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(127, 184, 216, 0.6)',
    shadowColor: 'rgba(127, 184, 216, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amberTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 36,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 8,
    marginBottom: 8,
  },
  amberSubtitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  narrationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.textPrimary,
    marginBottom: 32,
    maxWidth: '100%',
  },
  narrationText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    lineHeight: 22,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '80%',
    marginBottom: 24,
  },
  progressBar: {
    height: 3,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.textPrimary,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Theme.colors.textDim,
  },
  skipButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.15)',
  },
  skipText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 2,
    opacity: 0.6,
  },
});
