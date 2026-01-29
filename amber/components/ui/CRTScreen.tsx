import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';

interface CRTScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Enable scanline overlay effect */
  scanlines?: boolean;
  /** Enable vignette darkening at edges */
  vignette?: boolean;
  /** Enable glass reflection overlay */
  glassReflection?: boolean;
  /** Enable random horizontal glitch bands */
  glitchBands?: boolean;
  /** Intensity of scanlines 0-1 */
  scanlineIntensity?: number;
  /** Phosphor glow color */
  glowColor?: string;
  /** Enable subtle screen curvature illusion */
  curvature?: boolean;
}

/**
 * CRTScreen - Wraps content with retro CRT monitor effects
 * 
 * Effects include:
 * - Horizontal scanlines (alternating dark bands)
 * - Vignette (edge darkening)
 * - Glass reflection overlay
 * - Random horizontal glitch distortion bands
 * - Phosphor glow bleeding
 */
export const CRTScreen: React.FC<CRTScreenProps> = ({
  children,
  style,
  scanlines = true,
  vignette = true,
  glassReflection = true,
  glitchBands = true,
  scanlineIntensity = 0.15,
  glowColor = 'rgba(100, 255, 150, 0.03)',
  curvature = true,
}) => {
  // Glitch band animation
  const glitchOpacity = useRef(new Animated.Value(0)).current;
  const glitchY = useRef(new Animated.Value(0)).current;
  const glitchHeight = useRef(new Animated.Value(8)).current;
  const [glitchVisible, setGlitchVisible] = useState(false);

  // Random glitch trigger
  useEffect(() => {
    if (!glitchBands) return;

    const triggerGlitch = () => {
      const randomDelay = 3000 + Math.random() * 8000; // 3-11 seconds
      
      setTimeout(() => {
        // Set random position and height
        const randomY = Math.random() * 100;
        const randomHeight = 4 + Math.random() * 20;
        
        glitchY.setValue(randomY);
        glitchHeight.setValue(randomHeight);
        setGlitchVisible(true);
        
        // Glitch animation sequence
        Animated.sequence([
          Animated.timing(glitchOpacity, {
            toValue: 0.8 + Math.random() * 0.2,
            duration: 30,
            useNativeDriver: true,
          }),
          Animated.timing(glitchOpacity, {
            toValue: 0,
            duration: 50 + Math.random() * 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setGlitchVisible(false);
          triggerGlitch(); // Schedule next glitch
        });
      }, randomDelay);
    };

    triggerGlitch();
  }, [glitchBands]);

  return (
    <View style={[styles.container, style]}>
      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Phosphor glow overlay */}
      <View 
        style={[
          StyleSheet.absoluteFill, 
          styles.glowOverlay,
          { backgroundColor: glowColor }
        ]} 
        pointerEvents="none"
      />

      {/* Scanlines overlay */}
      {scanlines && (
        <View 
          style={[styles.scanlinesOverlay, { opacity: scanlineIntensity }]} 
          pointerEvents="none"
        >
          {/* Create scanlines with repeating pattern */}
          {[...Array(120)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.scanline,
                i % 2 === 0 ? styles.scanlineLight : styles.scanlineDark
              ]} 
            />
          ))}
        </View>
      )}

      {/* Vignette overlay */}
      {vignette && (
        <View style={styles.vignetteContainer} pointerEvents="none">
          {/* Top vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
            style={styles.vignetteTop}
          />
          {/* Bottom vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
            style={styles.vignetteBottom}
          />
          {/* Left vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.vignetteLeft}
          />
          {/* Right vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.vignetteRight}
          />
          {/* Corner darkening */}
          <View style={styles.cornerDarkening} />
        </View>
      )}

      {/* Glass reflection overlay */}
      {glassReflection && (
        <View style={styles.glassReflection} pointerEvents="none">
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.08)',
              'rgba(255,255,255,0.02)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassGradient}
          />
        </View>
      )}

      {/* Curvature illusion - subtle edge distortion */}
      {curvature && (
        <View style={styles.curvatureOverlay} pointerEvents="none">
          <View style={styles.curvatureEdge} />
        </View>
      )}

      {/* Glitch bands */}
      {glitchBands && glitchVisible && (
        <Animated.View
          style={[
            styles.glitchBand,
            {
              opacity: glitchOpacity,
              top: `${glitchY._value}%`,
              height: glitchHeight._value,
            },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

/**
 * ScanlineOverlay - Lightweight scanline-only effect for smaller UI elements
 */
export const ScanlineOverlay: React.FC<{ intensity?: number }> = ({ 
  intensity = 0.1 
}) => (
  <View 
    style={[styles.scanlinesOverlay, { opacity: intensity }]} 
    pointerEvents="none"
  >
    {[...Array(60)].map((_, i) => (
      <View 
        key={i} 
        style={[
          styles.scanline,
          i % 2 === 0 ? styles.scanlineLight : styles.scanlineDark
        ]} 
      />
    ))}
  </View>
);

/**
 * ScreenGlowBorder - Phosphor glow effect for screen borders
 */
export const ScreenGlowBorder: React.FC<{ 
  color?: string;
  intensity?: number;
}> = ({ 
  color = Theme.colors.accentApprove, 
  intensity = 0.3 
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View 
      style={[
        styles.glowBorder,
        { 
          shadowColor: color,
          shadowOpacity: intensity,
        }
      ]} 
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0a0c10',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  scanlinesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  scanline: {
    width: '100%',
    height: 2,
  },
  scanlineLight: {
    backgroundColor: 'transparent',
  },
  scanlineDark: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  vignetteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '15%',
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '15%',
  },
  cornerDarkening: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 30,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    zIndex: 20,
  },
  glassGradient: {
    flex: 1,
    borderRadius: 4,
  },
  curvatureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  curvatureEdge: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
  },
  glitchBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 25,
    // Chromatic aberration effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.3)',
  },
  glowBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 5,
  },
});

export default CRTScreen;
