import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SignalInterference = () => {
  // Anim for the 'rip' bars
  const ripAnim = useRef(new Animated.Value(0)).current;
  // Anim for general jitter
  const jitterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimations = () => {
      // High frequency jitter
      Animated.loop(
        Animated.sequence([
          Animated.timing(jitterAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(jitterAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Horizontal ripping bars
      const animateRip = () => {
        Animated.sequence([
          Animated.delay(Math.random() * 2000), // Random bursts
          Animated.timing(ripAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(ripAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start(() => animateRip());
      };
      animateRip();
    };

    startAnimations();
  }, []);

  // Generate a set of static horizontal "tears"
  const renderTears = () => {
    return [...Array(5)].map((_, i) => {
      const top = Math.random() * 100 + '%';
      const height = 1 + Math.random() * 3;
      const opacity = 0.1 + Math.random() * 0.3;

      return (
        <Animated.View
          key={`tear-${i}`}
          style={[
            styles.tear,
            {
              top,
              height,
              opacity: ripAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, opacity],
              }),
              transform: [{ scaleX: 1.5 }],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Heavy scanlines */}
      <View style={styles.scanlineLayer}>
        {[...Array(60)].map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>

      {/* Ripping bars */}
      {renderTears()}

      {/* Moving interference bar */}
      <Animated.View
        style={[
          styles.interferenceBar,
          {
            transform: [
              {
                translateY: jitterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 200],
                }),
              },
            ],
          },
        ]}
      />

      {/* General grain/noise simulation via low-opacity jitter layer */}
      <Animated.View 
        style={[
          styles.grainLayer, 
          { 
            opacity: jitterAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.05, 0.15],
            })
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 10,
  },
  scanlineLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  scanline: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tear: {
    position: 'absolute',
    width: '120%',
    left: '-10%',
    backgroundColor: '#fff',
  },
  interferenceBar: {
    position: 'absolute',
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
});
