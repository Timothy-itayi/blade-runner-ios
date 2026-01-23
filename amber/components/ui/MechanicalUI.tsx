import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../constants/theme';

interface MechanicalButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: any;
  active?: boolean;
}

export const MechanicalButton = ({ label, onPress, color = Theme.colors.industrialCream, disabled, style, active }: MechanicalButtonProps) => {
  const pressAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.buttonWrapper, style]}
    >
      <Animated.View style={[
        styles.buttonBase,
        { backgroundColor: disabled ? Theme.colors.bgMechanical : color },
        active && styles.buttonActive,
        {
          transform: [{
            translateY: pressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 2],
            })
          }]
        }
      ]}>
        <View style={styles.buttonTop}>
          <Text style={[
            styles.buttonText,
            { color: color === Theme.colors.buttonWhite ? '#000' : '#fff' },
            disabled && { color: Theme.colors.textDim }
          ]}>
            {label}
          </Text>
        </View>
      </Animated.View>
      <View style={styles.buttonShadow} />
    </TouchableOpacity>
  );
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
    height: 48,
    minWidth: 92,
  },
  buttonBase: {
    height: 44,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.5)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderRightColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  buttonActive: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  buttonTop: {
    paddingHorizontal: 12,
  },
  buttonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
    zIndex: 1,
    marginTop: 4,
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
