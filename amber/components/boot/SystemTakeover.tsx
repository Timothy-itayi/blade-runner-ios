import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../../constants/theme';

interface SystemTakeoverProps {
  onComplete: () => void;
}

export const SystemTakeover = ({ onComplete }: SystemTakeoverProps) => {
  const textOpacity = useRef(new Animated.Value(0)).current;
  const scanLineWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Simple, elegant sequence:
    // 1. Fade in text
    // 2. Scan line animates
    // 3. Hold briefly
    // 4. Fade out to boot
    
    const sequence = Animated.sequence([
      // Pause in darkness
      Animated.delay(400),
      // Fade in system text
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Animate scan line
      Animated.timing(scanLineWidth, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      // Hold
      Animated.delay(600),
      // Fade out everything
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(() => {
      onComplete();
    });
  }, []);
  
  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Center content */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.systemText}>TERMINAL ACCESS</Text>
        <Text style={styles.subText}>INITIALIZING</Text>
        
        {/* Animated scan line */}
        <View style={styles.scanLineContainer}>
          <Animated.View 
            style={[
              styles.scanLine,
              {
                width: scanLineWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>
      </Animated.View>
      
      {/* Corner brackets */}
      <View style={styles.cornerTL}>
        <Text style={styles.cornerText}>┌</Text>
      </View>
      <View style={styles.cornerTR}>
        <Text style={styles.cornerText}>┐</Text>
      </View>
      <View style={styles.cornerBL}>
        <Text style={styles.cornerText}>└</Text>
      </View>
      <View style={styles.cornerBR}>
        <Text style={styles.cornerText}>┘</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    padding: 40,
  },
  systemText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 6,
    textAlign: 'center',
  },
  subText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    letterSpacing: 4,
    marginTop: 8,
  },
  scanLineContainer: {
    width: 200,
    height: 2,
    backgroundColor: Theme.colors.border,
    marginTop: 24,
    overflow: 'hidden',
  },
  scanLine: {
    height: '100%',
    backgroundColor: Theme.colors.textPrimary,
  },
  cornerTL: {
    position: 'absolute',
    top: 100,
    left: 40,
  },
  cornerTR: {
    position: 'absolute',
    top: 100,
    right: 40,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 100,
    left: 40,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 100,
    right: 40,
  },
  cornerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 28,
    color: Theme.colors.textDim,
  },
});
