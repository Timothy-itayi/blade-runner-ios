import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';

// Logo dimensions – use aspect ratio so the image isn't forced into a square
const LOGO_WIDTH = 0.4; // fraction of screen width

interface AmberLogoScreenProps {
  onComplete?: () => void;
  duration?: number; // How long to show the logo screen
}

/**
 * AmberLogoScreen
 *
 * CRT terminal-style boot logo screen that displays after the boot sequence.
 * Shows the AMBER logo with subtle green phosphor glow.
 */
export default function AmberLogoScreen({
  onComplete,
  duration = 3500,
}: AmberLogoScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const scanlineOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scanline animation
    const scanAnim = Animated.loop(
      Animated.timing(scanlineOffset, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );
    scanAnim.start();

    // Glow pulse animation
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    // Logo fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in (delayed)
    const textTimer = setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Complete after duration
    const completeTimer = setTimeout(() => {
      // Fade out before completing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
      scanAnim.stop();
      pulseAnim.stop();
    };
  }, [duration, onComplete]);

  return (
    <View style={styles.container}>
      {/* Scanline effect */}
      <Animated.View
        style={[
          styles.scanline,
          {
            transform: [
              {
                translateY: scanlineOffset.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      />

      {/* Screen glow */}
      <Animated.View style={[styles.screenGlow, { opacity: glowPulse }]} pointerEvents="none" />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo glow effect (behind image) */}
        <Animated.View style={[styles.logoGlow, { opacity: Animated.multiply(glowPulse, 0.4) }]} />
        <Image source={require('../../assets/app-icon.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* AMBER text */}
      <Animated.View style={[styles.textContainer, { opacity: textFadeAnim }]}>
        <Text style={styles.titleText}>AMBER</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitleText}>ALERT ASSISTANCE SYSTEM</Text>
      </Animated.View>

      {/* Bottom tagline */}
      <Animated.View style={[styles.bottomContainer, { opacity: textFadeAnim }]}>
        <Text style={styles.versionText}>v1.0.0</Text>
        <Text style={styles.taglineText}>SECTOR 9 SURVEILLANCE DIVISION</Text>
        <Text style={styles.terminalText}>{'>'}_</Text>
      </Animated.View>

      {/* CRT vignette corners */}
      <View style={[styles.vignette, styles.vignetteTL]} />
      <View style={[styles.vignette, styles.vignetteTR]} />
      <View style={[styles.vignette, styles.vignetteBL]} />
      <View style={[styles.vignette, styles.vignetteBR]} />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(90, 186, 106, 0.04)',
    zIndex: 10,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 138, 90, 0.02)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(90, 186, 106, 0.15)',
  },
  logo: {
    width: width * LOGO_WIDTH,
    height: width * LOGO_WIDTH,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '700',
    color: '#5aba6a',
    letterSpacing: 10,
    textShadowColor: '#3a8a4a',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  divider: {
    width: 80,
    height: 1,
    backgroundColor: '#3a6a4a',
    marginVertical: 12,
  },
  subtitleText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#4a8a5a',
    letterSpacing: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#3a6a4a',
    letterSpacing: 1,
  },
  taglineText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#2a5a3a',
    letterSpacing: 2,
    marginTop: 4,
  },
  terminalText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4a8a5a',
    marginTop: 16,
  },
  vignette: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  vignetteTL: {
    top: 0,
    left: 0,
    borderBottomRightRadius: 60,
  },
  vignetteTR: {
    top: 0,
    right: 0,
    borderBottomLeftRadius: 60,
  },
  vignetteBL: {
    bottom: 0,
    left: 0,
    borderTopRightRadius: 60,
  },
  vignetteBR: {
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 60,
  },
});
