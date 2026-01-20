import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../../constants/theme';

interface DecisionStampProps {
  type: 'APPROVE' | 'DENY';
  visible: boolean;
}

export const DecisionStamp = ({ type, visible }: DecisionStampProps) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Digital "pop" and flicker animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 0.4, duration: 40, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 0.7, duration: 50, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        )
      ]).start();
    } else {
      opacityAnim.setValue(0);
      flickerAnim.setValue(0);
      scaleAnim.setValue(0.8);
      scanLineAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isApprove = type === 'APPROVE';
  const color = isApprove ? Theme.colors.accentApprove : Theme.colors.accentDeny;
  const stampText = isApprove ? 'IDENT VERIFIED' : 'ACCESS REVOKED';
  const subText = isApprove ? 'AUTH_LEVEL: ALPHA' : 'RESTRICTION: OMEGA';
  const code = isApprove ? 'PASS' : 'FAIL';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: Animated.multiply(opacityAnim, flickerAnim),
          transform: [{ scale: scaleAnim }]
        }
      ]}
      pointerEvents="none"
    >
      <View style={[styles.stampBox, { borderColor: color }]}>
        <View style={styles.topRow}>
          <Text style={[styles.codeText, { color }]}>{code}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
        </View>
        
        <View style={[styles.divider, { backgroundColor: color, opacity: 0.3 }]} />
        
        <Text style={[styles.labelText, { color }]}>{stampText}</Text>
        <Text style={[styles.subLabelText, { color, opacity: 0.7 }]}>{subText}</Text>
        
        <View style={styles.noiseContainer}>
          <Text style={[styles.noiseText, { color, opacity: 0.2 }]}>01101001 01100100</Text>
        </View>

        {/* Animated Scan Line */}
        <Animated.View 
          style={[
            styles.scanLine, 
            { 
              backgroundColor: color,
              transform: [{
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 80]
                })
              }]
            }
          ]} 
        />
        
        {/* Digital Noise / Corners */}
        <View style={[styles.corner, styles.topLeft, { borderColor: color }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: color }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: color }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: color }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  stampBox: {
    width: 180,
    height: 90,
    borderWidth: 1,
    backgroundColor: 'rgba(10, 12, 15, 0.85)',
    padding: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 8,
  },
  labelText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subLabelText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '400',
    marginTop: 2,
  },
  noiseContainer: {
    marginTop: 4,
  },
  noiseText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.4,
  },
  corner: {
    position: 'absolute',
    width: 6,
    height: 6,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
