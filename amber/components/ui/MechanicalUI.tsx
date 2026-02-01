import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Theme } from '../../constants/theme';
import { LEDIndicator } from './LabelTape';

// Metal texture for button surfaces
const METAL_TEXTURE = require('../../assets/textures/Texturelabs_Metal_264S.jpg');

interface MechanicalButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: any;
  active?: boolean;
  /** Show LED indicator */
  showLED?: boolean;
  /** LED color */
  ledColor?: 'green' | 'red' | 'yellow' | 'blue';
  /** LED active state (defaults to !disabled) */
  ledActive?: boolean;
  /** Button variant: inset = sunk into panel (no drop shadow, recessed borders) */
  variant?: 'standard' | 'toggle' | 'key' | 'inset';
}

export const MechanicalButton = ({ 
  label, 
  onPress, 
  color = Theme.colors.industrialCream, 
  disabled, 
  style, 
  active,
  showLED = false,
  ledColor = 'green',
  ledActive,
  variant = 'standard',
}: MechanicalButtonProps) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // LED is active when explicitly set, or defaults to !disabled
  const isLedActive = ledActive !== undefined ? ledActive : !disabled;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      Animated.timing(glowAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // Determine button styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'toggle':
        return styles.buttonToggle;
      case 'key':
        return styles.buttonKey;
      case 'inset':
        return styles.buttonInset;
      default:
        return {};
    }
  };

  const isInset = variant === 'inset';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.buttonWrapper, style]}
    >
      {/* LED Indicator */}
      {showLED && (
        <View style={styles.ledPosition}>
          <LEDIndicator 
            active={isLedActive} 
            color={ledColor} 
            size={6}
          />
        </View>
      )}

      {/* Button shadow/depth - omit for inset (sunk) variant */}
      {!isInset && <View style={styles.buttonShadow} />}
      
      {/* Main button body - sinks in when pressed (scale + slight down), not pop-up */}
      <Animated.View style={[
        styles.buttonBase,
        getVariantStyles(),
        { backgroundColor: disabled ? Theme.colors.bgMechanical : color },
        active && styles.buttonActive,
        {
          transform: [
            {
              translateY: pressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              }),
            },
            {
              scaleY: pressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.96],
              }),
            },
            {
              scaleX: pressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.99],
              }),
            },
          ],
        },
      ]}>
        {/* Metal texture overlay */}
        <View style={styles.buttonTextureContainer}>
          <Image
            source={METAL_TEXTURE}
            style={styles.buttonTexture}
            contentFit="cover"
          />
        </View>

        {/* Highlight edge (top-left light) - reversed for inset */}
        <View style={[styles.buttonHighlight, isInset && styles.buttonHighlightInset]} />
        
        {/* Button face */}
        <View style={styles.buttonTop}>
          <Text style={[
            styles.buttonText,
            { color: getTextColor(color, disabled) },
            disabled && { color: Theme.colors.textDim, opacity: 0.6 }
          ]}>
            {label}
          </Text>
        </View>

        {/* Press glow effect */}
        <Animated.View 
          style={[
            styles.buttonGlow,
            { 
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              backgroundColor: color,
            }
          ]} 
          pointerEvents="none"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Helper to determine text color based on background
const getTextColor = (bgColor: string, disabled?: boolean): string => {
  if (disabled) return Theme.colors.textDim;
  
  // Light backgrounds get dark text
  if (bgColor === Theme.colors.buttonWhite || 
      bgColor === Theme.colors.industrialCream ||
      bgColor === Theme.colors.buttonYellow) {
    return '#1a1a1a';
  }
  return '#ffffff';
};

export const Knob = ({ label, value = 0, style }: { label: string, value?: number, style?: any }) => {
  return (
    <View style={[styles.knobContainer, style]}>
      <View style={styles.knobOuter}>
        <View style={[styles.knobInner, { transform: [{ rotate: `${value * 360}deg` }] }]}>
          <View style={styles.knobPointer} />
        </View>
      </View>
      <Text style={styles.knobLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    height: 52,
    minWidth: 92,
    position: 'relative',
  },
  ledPosition: {
    position: 'absolute',
    top: -2,
    right: 4,
    zIndex: 10,
  },
  buttonBase: {
    height: 46,
    borderRadius: 3,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderLeftColor: 'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(0,0,0,0.5)',
    borderRightColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    overflow: 'hidden',
    // Raised key effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonTextureContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    overflow: 'hidden',
  },
  buttonTexture: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  buttonToggle: {
    borderRadius: 4,
    height: 40,
    borderWidth: 3,
  },
  buttonKey: {
    borderRadius: 2,
    height: 50,
    minWidth: 50,
  },
  buttonInset: {
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.15)',
    borderRightColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonHighlightInset: {
    top: undefined,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  buttonActive: {
    borderColor: '#fff',
    borderWidth: 2,
    shadowColor: '#fff',
    shadowOpacity: 0.3,
  },
  buttonTop: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  buttonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    // Subtle emboss effect
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 2,
    zIndex: 1,
    marginTop: 2,
  },
  knobContainer: {
    alignItems: 'center',
    gap: 4,
  },
  knobOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.industrialGray,
    borderWidth: 2,
    borderColor: Theme.colors.knobHighlight,
    borderBottomColor: '#1a1d23',
    borderRightColor: '#1a1d23',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.bezel,
  },
  knobInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.knobBase,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobPointer: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 10,
    backgroundColor: Theme.colors.accentWarn,
    borderRadius: 1,
  },
  knobLabel: {
    color: Theme.colors.industrialCream,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
