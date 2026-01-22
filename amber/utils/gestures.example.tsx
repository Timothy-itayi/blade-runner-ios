// =============================================================================
// GESTURE UTILITIES - Usage Examples
// =============================================================================
// Example implementations showing how to use the gesture utilities

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  createPressureHold,
  createSwipeReveal,
  createCarouselSwipe,
  createHapticFeedback,
  type PressureHoldCallbacks,
  type SwipeRevealCallbacks,
  type CarouselCallbacks,
} from './gestures';

// =============================================================================
// EXAMPLE 1: Eye Scanner Pressure Hold
// =============================================================================

export const EyeScannerExample = () => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanQuality, setScanQuality] = useState<'PARTIAL' | 'STANDARD' | 'DEEP' | 'COMPLETE' | null>(null);

  const eyeScannerCallbacks: PressureHoldCallbacks = {
    onStart: () => {
      setScanProgress(0);
      setScanQuality(null);
      console.log('Eye scan started');
    },
    onUpdate: (pressure) => {
      setScanProgress(pressure);
      // Update visual progress ring
    },
    onComplete: (finalPressure) => {
      // Determine scan quality based on hold duration
      if (finalPressure < 0.33) {
        setScanQuality('PARTIAL');
      } else if (finalPressure < 0.66) {
        setScanQuality('STANDARD');
      } else if (finalPressure < 0.9) {
        setScanQuality('DEEP');
      } else {
        setScanQuality('COMPLETE');
      }
      console.log(`Scan complete: ${scanQuality} (${Math.round(finalPressure * 100)}%)`);
    },
    onCancel: () => {
      setScanProgress(0);
      setScanQuality(null);
      console.log('Scan cancelled');
    },
  };

  const eyeScannerGesture = createPressureHold(
    eyeScannerCallbacks,
    3000, // 3 second max duration
    200,  // 200ms minimum
    true  // haptic enabled
  );

  return (
    <GestureDetector gesture={eyeScannerGesture}>
      <View style={styles.container}>
        <Text>Eye Scanner Area</Text>
        {scanProgress > 0 && (
          <View style={[styles.progressBar, { width: `${scanProgress * 100}%` }]} />
        )}
        {scanQuality && <Text>Quality: {scanQuality}</Text>}
      </View>
    </GestureDetector>
  );
};

// =============================================================================
// EXAMPLE 2: Credentials Swipe-Down Reveal
// =============================================================================

export const CredentialsSwipeExample = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProgress, setDrawerProgress] = useState(0);

  const credentialsCallbacks: SwipeRevealCallbacks = {
    onStart: () => {
      console.log('Swipe started');
    },
    onUpdate: (progress) => {
      setDrawerProgress(progress);
      // Update drawer position based on progress
    },
    onComplete: () => {
      setDrawerOpen(true);
      console.log('Credentials revealed');
    },
    onCancel: () => {
      setDrawerProgress(0);
      console.log('Swipe cancelled');
    },
  };

  const credentialsGesture = createSwipeReveal(
    'down',
    credentialsCallbacks,
    100,  // 100px threshold
    500,  // 500px/s velocity threshold
    true  // haptic enabled
  );

  return (
    <GestureDetector gesture={credentialsGesture}>
      <View style={styles.container}>
        <Text>Swipe Down to Reveal Credentials</Text>
        {drawerOpen && (
          <View style={styles.drawer}>
            <Text>Credentials Content</Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

// =============================================================================
// EXAMPLE 3: Interrogation Pressure System
// =============================================================================

export const InterrogationPressureExample = () => {
  const [pressure, setPressure] = useState(0);
  const [intensity, setIntensity] = useState<'SURFACE' | 'DEFENSIVE' | 'PROBING' | 'INTENSE' | 'BREAKING' | null>(null);

  const interrogationCallbacks: PressureHoldCallbacks = {
    onStart: () => {
      setPressure(0);
      setIntensity(null);
      console.log('Interrogation started');
    },
    onUpdate: (pressureValue) => {
      setPressure(pressureValue);
      
      // Determine intensity band
      if (pressureValue < 0.2) {
        setIntensity('SURFACE');
      } else if (pressureValue < 0.5) {
        setIntensity('DEFENSIVE');
      } else if (pressureValue < 0.8) {
        setIntensity('PROBING');
      } else if (pressureValue < 1.0) {
        setIntensity('INTENSE');
      } else {
        setIntensity('BREAKING');
      }
    },
    onComplete: (finalPressure) => {
      // Ask question with determined intensity
      console.log(`Question asked at ${intensity} intensity (${Math.round(finalPressure * 100)}%)`);
      // Reset for next question
      setPressure(0);
      setIntensity(null);
    },
  };

  const interrogationGesture = createPressureHold(
    interrogationCallbacks,
    3000, // 3 second max
    200,  // 200ms minimum
    true  // haptic enabled
  );

  return (
    <GestureDetector gesture={interrogationGesture}>
      <View style={styles.container}>
        <Text>Hold to Interrogate</Text>
        {pressure > 0 && (
          <>
            <View style={[styles.pressureMeter, { width: `${pressure * 100}%` }]} />
            <Text>Intensity: {intensity}</Text>
          </>
        )}
      </View>
    </GestureDetector>
  );
};

// =============================================================================
// EXAMPLE 4: Intel Panel Carousel
// =============================================================================

export const CarouselExample = () => {
  const [currentMode, setCurrentMode] = useState(0);
  const modes = ['VERIFICATION', 'DOSSIER', 'INTERROGATION'];

  const carouselCallbacks: CarouselCallbacks = {
    onSwipeLeft: () => {
      setCurrentMode((prev) => (prev + 1) % modes.length);
      console.log(`Swiped to: ${modes[(currentMode + 1) % modes.length]}`);
    },
    onSwipeRight: () => {
      setCurrentMode((prev) => (prev - 1 + modes.length) % modes.length);
      console.log(`Swiped to: ${modes[(currentMode - 1 + modes.length) % modes.length]}`);
    },
    onUpdate: (offset) => {
      // Update visual offset for smooth transition
      console.log(`Carousel offset: ${offset}`);
    },
  };

  const carouselGesture = createCarouselSwipe(
    carouselCallbacks,
    100, // 100px threshold
    true // haptic enabled
  );

  return (
    <GestureDetector gesture={carouselGesture}>
      <View style={styles.container}>
        <Text>Current Mode: {modes[currentMode]}</Text>
        <Text>Swipe left/right to change</Text>
      </View>
    </GestureDetector>
  );
};

// =============================================================================
// EXAMPLE 5: Direct Haptic Feedback
// =============================================================================

export const HapticExample = () => {
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    createHapticFeedback(intensity, true);
  };

  return (
    <View style={styles.container}>
      <Text onPress={() => triggerHaptic('light')}>Light Haptic</Text>
      <Text onPress={() => triggerHaptic('medium')}>Medium Haptic</Text>
      <Text onPress={() => triggerHaptic('heavy')}>Heavy Haptic</Text>
      <Text onPress={() => triggerHaptic('success')}>Success Haptic</Text>
      <Text onPress={() => triggerHaptic('error')}>Error Haptic</Text>
      <Text onPress={() => triggerHaptic('warning')}>Warning Haptic</Text>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4a9eff',
    marginTop: 10,
  },
  drawer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
  pressureMeter: {
    height: 8,
    backgroundColor: '#ff4a4a',
    marginTop: 10,
    borderRadius: 4,
  },
});
