import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../constants/theme';

interface DecisionStampProps {
  type: 'APPROVE' | 'DENY';
  visible: boolean;
}

export const DecisionStamp = ({ type, visible }: DecisionStampProps) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Digital "pop" and flicker animation
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.3, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      flickerAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isApprove = type === 'APPROVE';
  const color = isApprove ? Theme.colors.accentApprove : Theme.colors.accentDeny;
  const stampText = isApprove ? 'IDENT VERIFIED' : 'ACCESS REVOKED';
  const code = isApprove ? '✓ A' : '✗ D';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.eyeOverlayContainer}>
        <Animated.View 
          style={[
            styles.digitalStamp, 
            { 
              borderColor: color,
              opacity: Animated.multiply(opacityAnim, flickerAnim),
            }
          ]}
        >
          <View style={[styles.innerBorder, { borderColor: color }]}>
            <Text style={[styles.codeText, { color }]}>{code}</Text>
          </View>
          <Text style={[styles.labelText, { color }]}>{stampText}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eyeOverlayContainer: {
    position: 'absolute',
    top: 150, // Center over the EyeDisplay roughly
    left: 40,
    width: 150,
    alignItems: 'center',
    zIndex: 1000,
  },
  digitalStamp: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 15, 0.9)',
  },
  innerBorder: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    marginBottom: 4,
  },
  codeText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 24,
    fontWeight: '900',
  },
  labelText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
