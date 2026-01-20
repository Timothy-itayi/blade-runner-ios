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
const STATIC_GIF = require('../../assets/videos/static.gif');

const INTRO_SLIDES = [INTRO_SLIDE, INTRO_SLIDE1, INTRO_SLIDE2, INTRO_SLIDE3];
const SLIDE_DURATION = 12000; // 12 seconds per slide

// Script segments timed to the audio narration (adjusted +1000ms for slower timing)
const NARRATION_SEGMENTS = [
  {
    text: "Welcome to AMBER: the Automated Movement and Biometric Evaluation Registry.",
    startTime: 1000,
    duration: 5000,
  },
  {
    text: "In our pursuit of systemic stability, we oversee the safe passage of subjects across established sector lines.",
    startTime: 6000,
    duration: 6000,
  },
  {
    text: "Your directive is simple: Confirm. Evaluate. And either Approve or Deny.",
    startTime: 12000,
    duration: 5500,
  },
  {
    text: "Through advanced retinal analysis and real-time biometric monitoring, you will identify discrepancies where the naked eye cannot.",
    startTime: 17500,
    duration: 7000,
  },
  {
    text: "Every evaluation is a permanent entry in our global registry.",
    startTime: 24500,
    duration: 4000,
  },
  {
    text: "Every decision you make ensures the integrity of the network and the safety of the civilian population.",
    startTime: 28500,
    duration: 6000,
  },
  {
    text: "At AMBER, we are securing identity and protecting tomorrow.",
    startTime: 34500,
    duration: 5000,
  },
  {
    text: "Your shift begins now.",
    startTime: 39500,
    duration: 3500,
  },
];

const TOTAL_DURATION = 45000; // Total narration duration in ms (adjusted for +1000ms delay)

interface AmberIntroProps {
  onComplete: () => void;
}

export const AmberIntro = ({ onComplete }: AmberIntroProps) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(0)).current;
  const glitchTranslateX = useRef(new Animated.Value(0)).current;

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  // Narration audio player (voice-over)
  const narrationPlayer = useAudioPlayer(INTRO_NARRATION);

  // Intro music control (to fade out when done)
  const { fadeOutMenuSoundtrack } = useIntroAudio({ musicVolume: 1, sfxVolume: 1 });

  // Progress bar animation - smooth continuous movement
  useEffect(() => {
    if (!isPlaying) return;

    // Animate progress bar from 0 to 100% over total duration
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: TOTAL_DURATION,
      easing: Easing.linear,
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [isPlaying]);

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

    // Glitch effect at the end
    const glitchSequence = Animated.sequence([
      // Quick glitch bursts
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 1,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: -3,
          duration: 30,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);

    glitchSequence.start(() => {
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
              <Animated.View 
                style={[
                  styles.slideContainer, 
                  { 
                    opacity: slideOpacity,
                    transform: [{ translateX: glitchTranslateX }],
                  }
                ]}
              >
                <Image
                  source={INTRO_SLIDES[currentSlideIndex]}
                  style={styles.introImage}
                  contentFit="cover"
                />
              </Animated.View>

              {/* Static gif overlay for glitch effect only */}
              <Animated.View
                style={[
                  styles.staticOverlay,
                  { opacity: glitchOpacity },
                ]}
              >
                <Image
                  source={STATIC_GIF}
                  style={StyleSheet.absoluteFill}
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
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
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
    transform: [{ perspective: 1000 }],
  },
  tvBezel: {
    width: '100%',
    backgroundColor: '#000000',
    padding: 20, // Thick bezel like 2000s TV
    borderRadius: 8,
    // 3D depth of field effect with multiple shadow layers
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
    // Inner shadow effect for depth
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    // Gradient-like effect using multiple shadows
  },
  tvScreen: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 2,
    // Inner glow effect
    borderWidth: 1,
    borderColor: 'rgba(127, 184, 216, 0.1)',
    // Screen depth shadow
    shadowColor: 'rgba(127, 184, 216, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  slideContainer: {
    width: '100%',
    height: '100%',
  },
  introImage: {
    width: '100%',
    height: '100%',
  },
  staticOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
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
    zIndex: 5,
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
    borderWidth: 2,
    borderColor: Theme.colors.textPrimary,
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
